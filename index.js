const _ = require('lodash');
const axios = require('axios');

const MAX_RETURNED_IDS = 250;
const TARGET_PRODUCT_TYPES = ['Clock', 'Watch'];

const shopicruit = axios.create({
  baseURL: 'https://shopicruit.myshopify.com',
  timeout: 5000,
});

function getProductTypesVariants(productTypes, page = 1, results = []) {
  return shopicruit.get('/products.json', {
    params: {
      page,
      limit: MAX_RETURNED_IDS,
    },
  })
  .then(resp => {
    if (resp.status !== 200) throw new Error('Non-200 response from API');

    // terminate recursion on no results returned.
    if (_.isEmpty(resp.data.products)) return results;

    const targetProductsVariants = _(resp.data.products)
      .filter(product => _.includes(productTypes, product.product_type))
      .flatMapDeep('variants')
      .value();

    results.push(...targetProductsVariants);

    // seek next page via recursion
    return getProductTypesVariants(productTypes, page + 1, results);
  });
}

getProductTypesVariants(TARGET_PRODUCT_TYPES)
  .then(variants => {
    const totalCost = _.reduce(
      variants,
      (total, variant) => total + _.toNumber(variant.price),
      0
    );

    console.log(`Searched for: ${TARGET_PRODUCT_TYPES}`);
    console.log(`Found ${_.size(variants)} variants totaling $${totalCost.toFixed(2)}`);
  })
  .catch(err => console.error(err));
