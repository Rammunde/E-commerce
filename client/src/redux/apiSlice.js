import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl }),
    tagTypes: ["Cart", "Products"],
    endpoints: (builder) => ({
        getProducts: builder.query({
            query: ({ page, limit, search }) =>
                `/products/getProductList?page=${page}&limit=${limit}&search=${search}`,
            providesTags: ["Products"],
        }),
        getCartCount: builder.query({
            query: (userId) => `/products/getAddedItems/${userId}`,
            transformResponse: (response) => response.total_items ?? 0,
            providesTags: ["Cart"],
        }),
        addToCart: builder.mutation({
            query: (formData) => ({
                url: "/products/addProductToCart",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Cart"],
        }),
        loginUser: builder.mutation({
            query: (credentials) => ({
                url: "/users/loginUser",
                method: "POST",
                body: credentials,
            }),
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetCartCountQuery,
    useAddToCartMutation,
    useLoginUserMutation,
} = apiSlice;
