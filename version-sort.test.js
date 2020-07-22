const test = require('ava');
const versionSort = require('./version-sort');

test('should sort by some number', t => {
  const arr = [
    '3__yet-another-file.sql',
    '1__file.sql',
    '2__other-file.sql',
  ];

  const expected = [
    '1__file.sql',
    '2__other-file.sql',
    '3__yet-another-file.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);

  const expectedOriginal = [
    '3__yet-another-file.sql',
    '1__file.sql',
    '2__other-file.sql',
  ];

  t.deepEqual(arr, expectedOriginal);
});

test('handle prefixes', t => {
  const arr = [
    'V3__yet-another-file.sql',
    'V1__file.sql',
    'V2__other-file.sql',
  ];

  const expected = [
    'V1__file.sql',
    'V2__other-file.sql',
    'V3__yet-another-file.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);
});

test('leading zeros', t => {
  const arr = [
    'v003__yet-another-file.sql',
    'v001__file.sql',
    'v002__other-file.sql',
  ];

  const expected = [
    'v001__file.sql',
    'v002__other-file.sql',
    'v003__yet-another-file.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);
});

test('ignore later numbers', t => {
  const arr = [
    '3__yet-another-file1.sql',
    '1__file2.sql',
    '2__other-file3.sql',
  ];

  const expected = [
    '1__file2.sql',
    '2__other-file3.sql',
    '3__yet-another-file1.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);
});

test('should sort in place', t => {
  const arr = [
    '3_yet-another-file.sql',
    '1_file.sql',
    '2_other-file.sql',
  ];

  const expected = [
    '1_file.sql',
    '2_other-file.sql',
    '3_yet-another-file.sql',
  ];

  versionSort(arr, {inPlace: true});
  t.deepEqual(arr, expected);
});

test('should work with various separators', t => {
  const arr = [
    '3--yet-another-file.sql',
    '1_file.sql',
    '2-other-file.sql',
  ];

  const expected = [
    '1_file.sql',
    '2-other-file.sql',
    '3--yet-another-file.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);

  const expectedOriginal = [
    '3--yet-another-file.sql',
    '1_file.sql',
    '2-other-file.sql',
  ];

  t.deepEqual(arr, expectedOriginal);
});

test('does not require a separator', t => {
  const arr = [
    'v003yet-another-file.sql',
    'v001file.sql',
    'v002other-file.sql',
  ];

  const expected = [
    'v001file.sql',
    'v002other-file.sql',
    'v003yet-another-file.sql',
  ];

  const actual = versionSort(arr);
  t.deepEqual(actual, expected);
});

