import * as z from 'zod/mini';
import { describe, expect, it } from 'vitest';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { CliRun } from '../support/cli-run.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { runRecordedCli } from '../support/run-recorded-cli.function.ts';

const paris = [
  ...loadRecording(ProviderId.IgnFrance, 'notre-dame-paris').exchanges,
  ...loadRecording(ProviderId.Bing, 'notre-dame-paris').exchanges,
];
const run = (argv: string[]): Promise<CliRun> => runRecordedCli(paris, argv);
const reportJson = z.object({ newest: z.object({ date: z.object({ value: z.string(), precision: z.string() }) }) });
const providersJson = z.array(z.object({ id: z.string() }));

describe('imagery-date <latitude> <longitude>', () => {
  it('prints the newest photo, one row per provider and the caveat', async () => {
    const { code, output } = await run(['48.853', '2.3499', '--providers', 'ign-france,bing']);
    expect(code).toBe(0);
    expect(output).toContain('48.853, 2.3499 · zoom 19 · asked 2026-10-28T12:00:00.000Z');
    expect(output).toContain('Newest photo shown at this zoom: 2024-08-27 (IGN France BD ORTHO)');
    expect(output).toMatch(/IGN France BD ORTHO\s+found\s+2024-08-27\s+BD ORTHO 2024\s+0\.2 m/);
    expect(output).toMatch(/Bing Maps Aerial\s+found\s+2021-06-16\/2021-10-08\s+19/);
    expect(output).toContain('not proof the place still looks like that');
  });

  it('prints the report as JSON with --json', async () => {
    const { output } = await run(['48.853', '2.3499', '-p', 'ign-france', '--json']);
    expect(reportJson.parse(JSON.parse(output)).newest.date).toEqual({ value: '2024-08-27', precision: 'day' });
  });
});

describe('imagery-date misuse', () => {
  it.each([
    [['48.853'], 'Give a latitude and a longitude'],
    [['north', '2.35'], 'Latitude must be a number; got "north"'],
    [['91', '2.35'], 'Latitude must be within -90..90'],
    [['48.853', '2.3499', '--zoom', '30'], 'Zoom must be a whole number'],
    [['48.853', '2.3499', '-p', 'apple'], 'Unknown provider "apple"'],
    [['--colour'], "Unknown option '--colour'"],
    [['batch', 'points.csv', '--concurrency', '0'], 'at least 1'],
  ])('exits 2 for %j, saying why', async (argv, reason) => {
    const { code, errors, output } = await run(argv);
    expect(code).toBe(2);
    expect(errors).toContain(reason);
    expect(output).toBe('');
  });
});

describe('imagery-date help, version and providers', () => {
  it('prints help and the version', async () => {
    expect((await run(['--help'])).output).toContain('imagery-date history <latitude> <longitude>');
    expect((await run(['-v'])).output).toBe('0.1.0\n');
  });

  it('lists every provider with its terms, key and default, as a table or JSON', async () => {
    const table = (await run(['providers'])).output;
    expect(table).toMatch(/google-solar\s+Google Solar API\s+official-api-own-key\s+google\s+no\s+yes/);
    const listed = providersJson.parse(JSON.parse((await run(['providers', '--json'])).output));
    expect(listed.map((provider) => provider.id)).toContain(ProviderId.EsriWayback);
  });
});
