
import React from "react";

interface NetTermsStatusProps {
  status: string;
  terms?: string;
}

const NetTermsStatus = ({ status, terms }: NetTermsStatusProps) => {
  switch (status) {
    case "approved":
      return (
        <div className="mt-2 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">NET Terms Approved</p>
          <p className="text-sm text-green-600">Your NET {terms?.replace("net", "") || "30"} payment terms have been approved.</p>
        </div>
      );
    case "pending":
      return (
        <div className="mt-2 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Application Under Review</p>
          <p className="text-sm text-yellow-600">Your NET terms application is being reviewed. We'll notify you when a decision is made.</p>
        </div>
      );
    case "rejected":
      return (
        <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Application Not Approved</p>
          <p className="text-sm text-red-600">Unfortunately, your NET terms application wasn't approved at this time.</p>
        </div>
      );
    default:
      return null;
  }
};

export default NetTermsStatus;
