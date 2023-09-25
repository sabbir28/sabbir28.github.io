var BinaryConverter = {
    DecimalToBinary: function(decimal) {
      if (decimal === 0) return '0';
      if (decimal === 1) return '1';
  
      let binary = '';
      while (decimal > 0) {
        binary = (decimal % 2) + binary;
        decimal = Math.floor(decimal / 2);
      }
      return binary;
    },
  
    BinaryToDecimal: function(binary) {
      let decimal = 0;
      const binaryDigits = binary.split('').reverse();
  
      for (let i = 0; i < binaryDigits.length; i++) {
        if (binaryDigits[i] === '1') {
          decimal += 2 ** i;
        }
      }
  
      return decimal;
    }
  };
  
/*
  const decimalNumber = 10; // Change to your desired decimal number
  const binaryRepresentation = BinaryConverter.DecimalToBinary(decimalNumber);
  console.log(binaryRepresentation); // Output: '1010'
  
  const binaryString = '1010'; // Change to your desired binary string
  const decimalValue = BinaryConverter.BinaryToDecimal(binaryString);
  console.log(decimalValue); // Output: 10
*/