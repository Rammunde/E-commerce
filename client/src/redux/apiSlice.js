import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const apiSlice = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({ baseUrl }),
    tagTypes: ["Cart", "Products", "Reviews", "ReviewAnalysis"],
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
        removeFromCart: builder.mutation({
            query: ({ product_id, userId }) => ({
                url: "/products/removeAddedItems",
                method: "POST",
                body: { product_id, userId },
            }),
            invalidatesTags: ["Cart"],
        }),
        updateCartQuantity: builder.mutation({
            query: ({ product_id, userId, price, originalPrice, plus, minus }) => ({
                url: "/products/IncreaseDecreaseItems",
                method: "POST",
                body: { product_id, userId, price, originalPrice, plus, minus },
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
        getProductById: builder.query({
            query: (id) => `/products/getProduct/${id}`,
            providesTags: (result, error, id) => [{ type: "Products", id }],
        }),
        semanticSearch: builder.query({
            query: ({ query = "", page = 1, limit = 8 }) =>
                `/products/semantic-search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
            providesTags: ["Products"],
        }),
        getProductReviews: builder.query({
            query: (productId) => `/products/${productId}/reviews`,
            providesTags: (result, error, id) => [{ type: "Reviews", id }],
        }),
        addProductReview: builder.mutation({
            query: ({ productId, ...body }) => ({
                url: `/products/${productId}/reviews`,
                method: "POST",
                body,
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: "Reviews", id: productId },
                { type: "ReviewAnalysis", id: productId },
            ],
        }),
        deleteProductReview: builder.mutation({
            query: ({ productId, reviewId }) => ({
                url: `/products/${productId}/reviews/${reviewId}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, { productId }) => [
                { type: "Reviews", id: productId },
                { type: "ReviewAnalysis", id: productId },
            ],
        }),
        getReviewAnalysis: builder.query({
            query: (productId) => `/products/${productId}/review-analysis`,
            providesTags: (result, error, id) => [{ type: "ReviewAnalysis", id }],
        }),
        refreshReviewAnalysis: builder.mutation({
            query: (productId) => ({
                url: `/products/${productId}/review-analysis/refresh`,
                method: "POST",
            }),
            invalidatesTags: (result, error, productId) => [
                { type: "ReviewAnalysis", id: productId },
            ],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useSemanticSearchQuery,
    useGetCartCountQuery,
    useAddToCartMutation,
    useRemoveFromCartMutation,
    useUpdateCartQuantityMutation,
    useLoginUserMutation,
    useGetProductByIdQuery,
    useGetProductReviewsQuery,
    useAddProductReviewMutation,
    useDeleteProductReviewMutation,
    useGetReviewAnalysisQuery,
    useRefreshReviewAnalysisMutation,
} = apiSlice;
