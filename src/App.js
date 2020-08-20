import React from "react";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql,
  useQuery,
  createHttpLink,
} from "@apollo/client";

import { setContext } from "@apollo/client/link/context";
import "./App.css";

const httpLink = createHttpLink({
  uri: "https://graphql.myshopify.com/api/2019-07/graphql.json",
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": "ecdc7f91ed0970e733268535c828fbbe",
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function Product({ title, descriptionHtml, image, maxPrice, minPrice }) {
  return (
    <div className="product">
      <h2>{title}</h2>
      <img src={image} alt="Product " />
      <p dangerouslySetInnerHTML={{ __html: descriptionHtml }}></p>
      <h5>
        Price: {minPrice} to {maxPrice}{" "}
      </h5>
    </div>
  );
}

function ProductList() {
  const { loading, error, data } = useQuery(gql`
    {
      products(first: 6) {
        edges {
          node {
            id
            title
            descriptionHtml
            priceRange {
              maxVariantPrice {
                amount
                currencyCode
              }
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 1) {
              edges {
                node {
                  transformedSrc(crop: BOTTOM, maxWidth: 400, maxHeight: 300)
                }
              }
            }
          }
        }
      }
    }
  `);

  if (loading) return <p>Loading</p>;
  if (error) return <p className="error"> {JSON.stringify(error)} </p>;

  return data.products.edges.map(({ node }) => {
    return (
      <Product
        key={node.id}
        title={node.title}
        descriptionHtml={node.descriptionHtml}
        minPrice={
          node.priceRange.minVariantPrice.amount +
          node.priceRange.minVariantPrice.currencyCode
        }
        maxPrice={
          node.priceRange.maxVariantPrice.amount +
          node.priceRange.maxVariantPrice.currencyCode
        }
        image={node.images.edges[0].node.transformedSrc}
      />
    );
  });
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <ProductList />
      </div>
    </ApolloProvider>
  );
}

export default App;
