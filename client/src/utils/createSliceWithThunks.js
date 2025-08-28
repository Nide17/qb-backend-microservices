import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/**
 * A utility to create a Redux slice with async thunks
 * @param {Object} options - Configuration options
 * @param {string} options.name - The name of the slice
 * @param {Object} options.initialState - The initial state of the slice
 * @param {Object} options.reducers - Synchronous reducers
 * @param {Object} options.thunks - Async thunks configuration
 * @param {Function} [options.extraReducers] - Additional reducers
 * @returns {Object} The created slice
 */
export const createSliceWithThunks = ({
  name,
  initialState,
  reducers = {},
  thunks = {},
  extraReducers = (builder) => {},
}) => {
  // Create async thunks
  const asyncThunks = Object.entries(thunks).reduce((acc, [thunkName, thunkConfig]) => {
    const { type, payloadCreator, options } = thunkConfig;
    const thunk = createAsyncThunk(
      `${name}/${thunkName}`,
      async (arg, thunkAPI) => {
        try {
          const result = await payloadCreator(arg, thunkAPI);
          return result;
        } catch (error) {
          // You can add global error handling here
          console.error(`Error in ${name}/${thunkName}:`, error);
          return thunkAPI.rejectWithValue(
            error.response?.data?.message || error.message
          );
        }
      },
      options
    );
    return { ...acc, [thunkName]: thunk };
  }, {});

  // Create the slice
  const slice = createSlice({
    name,
    initialState: {
      loading: false,
      error: null,
      ...initialState,
    },
    reducers: {
      reset: (state) => {
        return { ...initialState, loading: false, error: null };
      },
      ...reducers,
    },
    extraReducers: (builder) => {
      // Add loading and error handling for all thunks
      Object.values(asyncThunks).forEach((thunk) => {
        builder
          .addCase(thunk.pending, (state) => {
            state.loading = true;
            state.error = null;
          })
          .addCase(thunk.fulfilled, (state) => {
            state.loading = false;
          })
          .addCase(thunk.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload || 'An error occurred';
          });
      });

      // Add any additional reducers
      extraReducers(builder);
    },
  });

  // Return the slice and the async thunks
  return {
    ...slice,
    ...asyncThunks,
  };
};
