export function b64decode(str) {
  const binary_string = window.atob(str);
  const len = binary_string.length;
  const bytes = new Uint8Array(new ArrayBuffer(len));
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export function b64encode(bytes) {
  const binary = String.fromCharCode(...bytes);
  return window.btoa(binary);
}

export const compressBlob = async (blob) => {
  const blobStream = blob.stream();
  const compressionStream = await blobStream.pipeThrough(new CompressionStream('gzip'));
  return new Response(compressionStream);
}

export const decompressBlob = async (blob) => {
  const blobStream = blob.stream();
  const decompressionStream = blobStream.pipeThrough(new DecompressionStream('gzip'));
  return new Response(decompressionStream);
}

export const compressJson = async (data) => {
  const jsonString = JSON.stringify(data);
  const jsonBlob = new Blob([jsonString]);
  const response = await compressBlob(jsonBlob);
  const bytesBlob = await response.blob();
  const buffer = await bytesBlob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  return b64encode(bytes);
}

export const decompressJson = async (b64Data) => {
  const bytes = b64decode(b64Data);
  const bytesBlob = new Blob([bytes]);
  const response = await decompressBlob(bytesBlob);
  return response.json();
}

export const decompressUrlData = async (urlEncodedData) => {
  if (urlEncodedData === '') return null;

  const b64Data = decodeURIComponent(urlEncodedData);
  return decompressJson(b64Data);
};

export const compressUrlData = async (data) => {
  if (data === null) return '';

  const b64Data = await compressJson(data);
  return encodeURIComponent(b64Data);
}
