"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  studentName: string;
  studentEmail: string;
  courseName: string;
  courseDates: string;
}

const STORAGE_KEY = "certificate-form-data";

export default function Home() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>();

  // Load saved course data on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { courseName, courseDates } = JSON.parse(saved);
      if (courseName) setValue("courseName", courseName);
      if (courseDates) setValue("courseDates", courseDates);
    }
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("/api/generate-cert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Save course data for next submission
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          courseName: data.courseName,
          courseDates: data.courseDates,
        }));

        setResult({
          success: true,
          message: `Certificate sent successfully to ${data.studentEmail}!`,
        });

        // Only reset student fields, keep course fields
        reset({
          studentName: "",
          studentEmail: "",
          courseName: data.courseName,
          courseDates: data.courseDates,
        });
      } else {
        setResult({
          success: false,
          message: result.error || "Failed to generate certificate",
        });
      }
    } catch {
      setResult({
        success: false,
        message: "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 16px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    backgroundColor: "#fff",
    color: "#000",
  };

  const labelStyle = {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "4px",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#eef2ff", padding: "48px 16px" }}>
      <div style={{ maxWidth: "448px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#111827" }}>
            Ghana Cert Generator
          </h1>
          <p style={{ marginTop: "8px", color: "#4b5563" }}>
            Generate and send course completion certificates
          </p>
        </div>

        <div style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", padding: "32px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="studentName" style={labelStyle}>
                Student Name
              </label>
              <input
                type="text"
                id="studentName"
                autoComplete="off"
                {...register("studentName", {
                  required: "Student name is required",
                })}
                style={inputStyle}
                placeholder="Enter student name"
              />
              {errors.studentName && (
                <p style={{ marginTop: "4px", fontSize: "14px", color: "#dc2626" }}>
                  {errors.studentName.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="studentEmail" style={labelStyle}>
                Student Email
              </label>
              <input
                type="email"
                id="studentEmail"
                autoComplete="off"
                {...register("studentEmail", {
                  required: "Student email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                style={inputStyle}
                placeholder="student@example.com"
              />
              {errors.studentEmail && (
                <p style={{ marginTop: "4px", fontSize: "14px", color: "#dc2626" }}>
                  {errors.studentEmail.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label htmlFor="courseName" style={labelStyle}>
                Course Name
              </label>
              <input
                type="text"
                id="courseName"
                autoComplete="off"
                {...register("courseName", {
                  required: "Course name is required",
                })}
                style={inputStyle}
                placeholder="Enter course name"
              />
              {errors.courseName && (
                <p style={{ marginTop: "4px", fontSize: "14px", color: "#dc2626" }}>
                  {errors.courseName.message}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="courseDates" style={labelStyle}>
                Course Dates
              </label>
              <input
                type="text"
                id="courseDates"
                autoComplete="off"
                {...register("courseDates", {
                  required: "Course dates are required",
                })}
                style={inputStyle}
                placeholder="e.g., January 15-17, 2025"
              />
              {errors.courseDates && (
                <p style={{ marginTop: "4px", fontSize: "14px", color: "#dc2626" }}>
                  {errors.courseDates.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px 16px",
                backgroundColor: isSubmitting ? "#818cf8" : "#4f46e5",
                color: "#fff",
                fontWeight: 500,
                borderRadius: "8px",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: "16px",
              }}
            >
              {isSubmitting ? "Generating Certificate..." : "Generate & Send Certificate"}
            </button>
          </form>

          {result && (
            <div
              style={{
                marginTop: "24px",
                padding: "16px",
                borderRadius: "8px",
                backgroundColor: result.success ? "#f0fdf4" : "#fef2f2",
                color: result.success ? "#166534" : "#991b1b",
                border: `1px solid ${result.success ? "#bbf7d0" : "#fecaca"}`,
              }}
            >
              {result.message}
            </div>
          )}
        </div>

        <p style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
          Powered by Tertiary Infotech Academy Pte Ltd
        </p>
      </div>
    </div>
  );
}
