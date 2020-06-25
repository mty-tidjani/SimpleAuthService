export const  strRandom = (length: number = 12) : string  => {
  let result = '';
  const characters = 'BCDFGHIJKLMNPQRSTVWXYZbcdfghijklmnpqrstvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const  numRandom = (length: number = 5) : string  => {
  let result = '';
  const characters = '123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
