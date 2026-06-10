import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { runCodeAPI, submitCodeAPI, getSubmissionsAPI, type Submission, type RunCodeResponse, type RunCodeRequest } from "./submissionAPI";

interface SubmissionState {
  submissions: Submission[];
  currentResult: RunCodeResponse | null;
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

const initialState: SubmissionState = {
  submissions: [],
  currentResult: null,
  loading: false,
  submitting: false,
  error: null,
};

export const runCode = createAsyncThunk<
  RunCodeResponse,
  RunCodeRequest,
  { rejectValue: string }
>("submissions/runCode", async (data, thunkAPI) => {
  try {
    return await runCodeAPI(data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message;
      return thunkAPI.rejectWithValue(typeof msg === "string" ? msg : "Run failed");
    }
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Run failed");
  }
});

export const submitCode = createAsyncThunk<
  Submission,
  RunCodeRequest,
  { rejectValue: string }
>("submissions/submitCode", async (data, thunkAPI) => {
  try {
    return await submitCodeAPI(data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message;
      return thunkAPI.rejectWithValue(typeof msg === "string" ? msg : "Submit failed");
    }
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Submit failed");
  }
});

export const fetchSubmissions = createAsyncThunk<
  Submission[],
  string,
  { rejectValue: string }
>("submissions/fetchSubmissions", async (problemSlug, thunkAPI) => {
  try {
    return await getSubmissionsAPI(problemSlug);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const msg = error.response?.data?.message;
      return thunkAPI.rejectWithValue(typeof msg === "string" ? msg : "Failed to fetch submissions");
    }
    return thunkAPI.rejectWithValue(error instanceof Error ? error.message : "Failed to fetch submissions");
  }
});

const submissionSlice = createSlice({
  name: "submissions",
  initialState,
  reducers: {
    clearCurrentResult: (state) => {
      state.currentResult = null;
    },
    clearSubmissions: (state) => {
      state.submissions = [];
      state.currentResult = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Run code
      .addCase(runCode.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentResult = null;
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResult = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Run failed";
      })

      // Submit code
      .addCase(submitCode.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.currentResult = null;
      })
      .addCase(submitCode.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentResult = {
          totalTestCases: action.payload.totalTestCases,
          passedTestCases: action.payload.passedTestCases,
          status: action.payload.status,
          testCaseResults: action.payload.testCaseResults,
        };
        // Prepend the new submission to the list
        state.submissions.unshift(action.payload);
      })
      .addCase(submitCode.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload ?? "Submit failed";
      })

      // Fetch submissions
      .addCase(fetchSubmissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubmissions.fulfilled, (state, action) => {
        state.loading = false;
        state.submissions = action.payload;
      })
      .addCase(fetchSubmissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch submissions";
      });
  },
});

export const { clearCurrentResult, clearSubmissions } = submissionSlice.actions;
export default submissionSlice.reducer;