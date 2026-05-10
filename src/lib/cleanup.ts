import { readdir, stat, unlink } from 'fs/promises';
import { join } from 'path';
import { getDb } from './db';

const RETENTION_DAYS = 30;
const RUN_INTERVAL_MS = 24 * 60 * 60 * 1000;
const STARTUP_DELAY_MS = 60 * 1000;

let scheduled = false;

export interface CleanupReport {
  deleted: string[];
  errors: string[];
  dbCleared: number;
}

/**
 * Scansiona uploads/audio/ e cancella i file con mtime piu' vecchio di
 * RETENTION_DAYS. Pulisce anche i riferimenti DB (audio_file_path,
 * download_token, download_expires_at) per gli ordini i cui file sono
 * appena stati rimossi.
 */
export async function cleanupOldAudio(): Promise<CleanupReport> {
  const report: CleanupReport = { deleted: [], errors: [], dbCleared: 0 };
  const uploadDir = join(process.cwd(), 'uploads', 'audio');

  let entries: string[];
  try {
    entries = await readdir(uploadDir);
  } catch (err: any) {
    if (err?.code === 'ENOENT') return report;
    report.errors.push(`Lettura cartella fallita: ${err?.message ?? err}`);
    return report;
  }

  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;

  for (const name of entries) {
    const filePath = join(uploadDir, name);
    try {
      const s = await stat(filePath);
      if (!s.isFile()) continue;
      if (s.mtimeMs < cutoff) {
        await unlink(filePath);
        report.deleted.push(filePath);
      }
    } catch (err: any) {
      report.errors.push(`${name}: ${err?.message ?? err}`);
    }
  }

  if (report.deleted.length > 0) {
    try {
      const db = getDb();
      const placeholders = report.deleted.map(() => '?').join(',');
      const [res] = await db.execute(
        `UPDATE orders
         SET audio_file_path = NULL,
             download_token = NULL,
             download_expires_at = NULL,
             updated_at = NOW()
         WHERE audio_file_path IN (${placeholders})`,
        report.deleted,
      );
      report.dbCleared = (res as any)?.affectedRows ?? 0;
    } catch (err: any) {
      report.errors.push(`DB cleanup fallito: ${err?.message ?? err}`);
    }
  }

  return report;
}

/**
 * Avvia uno scheduler interno che esegue cleanupOldAudio() poco dopo l'avvio
 * e poi una volta ogni 24h. Idempotente: chiamate successive sono no-op.
 */
export function startAudioCleanupScheduler(): void {
  if (scheduled) return;
  scheduled = true;

  const run = async () => {
    try {
      const r = await cleanupOldAudio();
      if (r.deleted.length || r.errors.length) {
        console.log(
          `[audio-cleanup] eliminati ${r.deleted.length} file, ` +
            `righe DB aggiornate ${r.dbCleared}, errori ${r.errors.length}`,
        );
        if (r.errors.length) console.warn('[audio-cleanup] errori:', r.errors);
      }
    } catch (err) {
      console.error('[audio-cleanup] errore generico:', err);
    }
  };

  setTimeout(run, STARTUP_DELAY_MS).unref?.();
  setInterval(run, RUN_INTERVAL_MS).unref?.();
}
