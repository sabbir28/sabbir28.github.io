function base64ToHex(base64Data) {
    // Remove the data URI prefix and split it into the data type and base64 portion
    const parts = base64Data.split(';base64,');
    if (parts.length !== 2) {
      throw new Error('Invalid base64 data URI format');
    }

    // Decode the base64 data and convert it to a hexadecimal representation
    const binaryData = atob(parts[1]);
    const byteArray = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      byteArray[i] = binaryData.charCodeAt(i);
    }

    const hexArray = Array.from(byteArray).map((byte) => byte.toString(16).padStart(2, '0'));
    return hexArray.join('');
}

function hexToBase64(hexData, mimeType) {
    // Convert the hexadecimal representation to binary data
    const hexArray = hexData.match(/.{1,2}/g);
    const byteArray = new Uint8Array(hexArray.map((byte) => parseInt(byte, 16)));

    // Convert the binary data to a base64 encoded string
    const binaryData = String.fromCharCode.apply(null, byteArray);
    const base64Data = `data:${mimeType};base64,` + btoa(binaryData);
    return base64Data;
}


/*

const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZRyb...'; // Your base64 data here
const hexData = base64ToHex(base64Data);
console.log(hexData);

const hexData = '...'; // Your hexadecimal data here
const mimeType = 'image/jpeg'; // Set the appropriate MIME type
const base64Data = hexToBase64(hexData, mimeType);
console.log(base64Data);


*/