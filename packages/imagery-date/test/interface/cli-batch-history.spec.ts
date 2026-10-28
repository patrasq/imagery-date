import { describe, expect, it } from 'vitest';
import { ProviderId } from '../../src/domain/provider/provider-id.enum.ts';
import type { CliRun } from '../support/cli-run.interface.ts';
import { loadRecording } from '../support/load-recording.function.ts';
import { runRecordedCli } from '../support/run-recorded-cli.function.ts';

const exchanges = [
  ...loadRecording(ProviderId.IgnFrance, 'notre-dame-paris').exchanges,
  ...loadRecording(ProviderId.Bing, 'notre-dame-paris').exchanges,
  ...loadRecording(ProviderId.EsriWayback, 'copenhagen-city-hall').exchanges,
];
const run = (argv: string[], files: Record<string, string> = {}): Promise<CliRun> =>
  runRecordedCli(exchanges, argv, files);
const POINTS = '﻿ID,Lat,Lon\r\n"Notre-Dame, Paris",48.853,2.3499\r\n\r\nrow-2,,2.3499\r\nrow-3,48.853,2.3499\r\n';

describe('imagery-date batch', () => {
  it('writes one CSV row per photo, in input order, a refused row in its place, and quotes what needs quoting', async () => {
    const { code, output } = await run(['batch', 'points.csv', '-p', 'ign-france,bing', '-c', '2'], {
      'points.csv': POINTS,
    });
    const lines = output.trimEnd().split('\n');
    expect(code).toBe(0);
    expect(lines[0]).toBe(
      'key,latitude,longitude,zoom,provider,status,date,precision,start,end,product,resolution_m,zoom_min,zoom_max,distance_m,published_on,newest,failure_code,failure_detail',
    );
    expect(lines[1]).toBe(
      '"Notre-Dame, Paris",48.853,2.3499,19,ign-france,found,2024-08-27,day,2024-08-27,2024-08-27,BD ORTHO 2024,0.2,,,,,yes,,',
    );
    expect(lines[2]).toBe(
      '"Notre-Dame, Paris",48.853,2.3499,19,bing,found,2021-06-16/2021-10-08,range,2021-06-16,2021-10-08,,,19,19,,,,,',
    );
    expect(lines[3]).toMatch(/^row-2,,,,,refused,,,,,,,,,,,,invalid-coordinates,"?Latitude must be within -90\.\.90/);
    expect(lines[4]?.startsWith('row-3,48.853,2.3499,19,ign-france,found')).toBe(true);
    expect(lines).toHaveLength(6);
  });

  it('refuses a CSV without coordinate columns', async () => {
    const { code, errors } = await run(['batch', 'points.csv'], { 'points.csv': 'name,city\na,b\n' });
    expect(code).toBe(2);
    expect(errors).toContain('needs latitude and longitude columns');
  });
});

describe('imagery-date history', () => {
  it('lists every photo Esri has shown since 2014 with the day it was first published', async () => {
    const { code, output } = await run(['history', '55.6761', '12.5683', '--zoom', '18']);
    expect(code).toBe(0);
    expect(output).toContain('Esri World Imagery has shown 9 different photos here since February 2014:');
    expect(output).toMatch(/2025-03-21\s+Vivid Advanced\s+0\.5 m\s+2025-09-04/);
    expect(output).toMatch(/2012-01-15\s+Denmark_2012\s+0\.1 m\s+2014-02-20/);
  });
});
