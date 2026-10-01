export const createCustomerMutation = /* GraphQL */ `
  mutation createCustomer($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;
