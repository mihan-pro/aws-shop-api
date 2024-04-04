import { productsList } from './productsMock.js';

export async function getProductsById(event){
    const { id } = event.pathParameters;
    const product = productsList.find((product) => product.id === id);
    if(!product) {
        return {
        statusCode: 404,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: 'Product not found'
        })
        }
    }

    return {
        statusCode: 200,
        headers: {
        'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(product)
    }
}
