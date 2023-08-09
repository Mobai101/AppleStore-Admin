const addImgProps = (productArr) => {
  const productOjb = JSON.parse(JSON.stringify(productArr));

  for (let i = 0; i < productOjb.images.length; i++) {
    productOjb[`img${i + 1}`] = productOjb.images[i];
  }

  return productOjb;
};

module.exports = addImgProps;
