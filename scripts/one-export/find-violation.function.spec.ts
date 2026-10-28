import { describe, expect, it } from 'vitest';
import { findViolation } from './find-violation.function.ts';

const LIB = 'packages/imagery-date/src';
const reason = (path: string, names: string[]): string | undefined => findViolation(path, names)?.reason;

describe(`${findViolation.name}: accepted files`, () => {
  it.each([
    [`${LIB}/domain/capture/capture-date.value-object.ts`, 'CaptureDate'],
    [`${LIB}/infrastructure/providers/ign-france/ign-france.provider.ts`, 'IgnFranceProvider'],
    [`${LIB}/infrastructure/providers/bing/bing.constants.ts`, 'BING'],
    [`${LIB}/domain/capture/date-precision.type.ts`, 'DatePrecisionValue'],
    [`${LIB}/application/ports/http-client.port.ts`, 'HttpClient'],
    [`${LIB}/domain/geo/tile-coordinate.value-object.ts`, 'TileCoordinate'],
    [
      `${LIB}/infrastructure/providers/swisstopo/swisstopo-identify-response.schema.ts`,
      'swisstopoIdentifyResponseSchema',
    ],
  ])('%s exporting %s', (path, name) => {
    expect(findViolation(path, [name])).toBeNull();
  });

  it('lets entry points, the two barrels and tests through', () => {
    expect(findViolation(`${LIB}/interface/cli/cli.ts`, [])).toBeNull();
    expect(findViolation('scripts/check-one-export.ts', [])).toBeNull();
    expect(findViolation(`${LIB}/index.ts`, ['A', 'B'])).toBeNull();
    expect(findViolation(`${LIB}/testing/index.ts`, ['A', 'B'])).toBeNull();
    expect(findViolation(`${LIB}/domain/capture/capture-date.value-object.spec.ts`, [])).toBeNull();
  });
});

describe(`${findViolation.name}: rejected files`, () => {
  it('rejects two exports in one file', () => {
    expect(reason(`${LIB}/domain/capture/capture-date.value-object.ts`, ['CaptureDate', 'Day'])).toMatch(
      /exports 2 symbols/,
    );
  });

  it('rejects a module that exports nothing, and a test that exports something', () => {
    expect(reason(`${LIB}/domain/geo/geo-point.value-object.ts`, [])).toMatch(/exports nothing/);
    expect(reason(`${LIB}/domain/geo/geo-point.value-object.spec.ts`, ['helper'])).toMatch(/must not export/);
  });

  it('rejects a missing role suffix and a name that does not match the file', () => {
    expect(reason(`${LIB}/domain/geo/geo-point.ts`, ['GeoPoint'])).toMatch(/no known role suffix/);
    expect(reason(`${LIB}/domain/geo/geo-point.value-object.ts`, ['Point'])).toMatch(/does not match/);
    expect(reason(`${LIB}/infrastructure/providers/bing/bing.provider.ts`, ['BingThing'])).toMatch(/does not match/);
  });
});
