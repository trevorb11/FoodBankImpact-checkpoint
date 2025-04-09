import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response, errorResponseData?: any) {
  if (!res.ok) {
    if (errorResponseData) {
      // Use the already parsed error data
      throw {
        status: res.status,
        statusText: res.statusText,
        message: errorResponseData.message || "An unexpected error occurred",
        details: errorResponseData.details || null,
        duplicates: errorResponseData.duplicates || null,
        errors: errorResponseData.errors || null
      };
    } else {
      try {
        // Try to parse response as JSON for more detailed error info
        const errorData = await res.json();
        throw {
          status: res.status,
          statusText: res.statusText,
          message: errorData.message || "An unexpected error occurred",
          details: errorData.details || null,
          duplicates: errorData.duplicates || null,
          errors: errorData.errors || null
        };
      } catch (e) {
        // If response is not JSON, use status text
        throw new Error(`${res.status}: ${res.statusText}`);
      }
    }
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T | null> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  if (res.status === 401) {
    return null;
  }

  try {
    // For non-success responses, handle the error
    if (!res.ok) {
      // Clone the response before reading
      const resClone = res.clone();
      
      let errorData: any = null;
      try {
        errorData = await resClone.json();
      } catch (e) {
        // If not parseable as JSON, we'll handle this in throwIfResNotOk
      }
      
      await throwIfResNotOk(res, errorData);
      return null; // This won't be reached, as throwIfResNotOk will throw
    }
    
    // For HEAD requests or empty responses
    if (res.status === 204 || res.headers.get("Content-Length") === "0") {
      return null;
    }
    
    // Parse the JSON response
    return await res.json();
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    try {
      // For non-success responses, handle the error
      if (!res.ok) {
        // Clone the response before reading
        const resClone = res.clone();
        
        let errorData: any = null;
        try {
          errorData = await resClone.json();
        } catch (e) {
          // If not parseable as JSON, we'll handle this in throwIfResNotOk
        }
        
        await throwIfResNotOk(res, errorData);
        return null; // This won't be reached, as throwIfResNotOk will throw
      }
      
      // For HEAD requests or empty responses
      if (res.status === 204 || res.headers.get("Content-Length") === "0") {
        return null;
      }
      
      return await res.json();
    } catch (error) {
      console.error("Query Error:", error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
