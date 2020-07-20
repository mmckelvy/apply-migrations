module.exports = function versionSort(arr, { inPlace } = {}) {
  const x = inPlace
    ? arr
    : arr.slice();

  return x.sort((a, b) => {
    const [ aName, aExtension ] = a.split('.');
    const [ bName, bExtension ] = b.split('.');

    // extract the version numbers.
    const [ aVersion ] = aName.match(/\d+/);
    const [ bVersion ] = bName.match(/\d+/);

    return aVersion - bVersion;
  });
};