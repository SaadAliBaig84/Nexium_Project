"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/app/core/supabase/client";
import { useRouter } from "next/navigation";
import { BrainCircuit, Loader, Upload, X, User } from "lucide-react"; // ✅ User icon added
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function TailorResumePage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false); // ✅ State for dropdown

  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [tailoredResume, setTailoredResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUserEmail(data.user.email ?? null);
      else router.replace("/sign-in");
    };
    getUser();
  }, [router]);

  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") setPdfFile(file);
  };

  const handleGenerate = async () => {
    if (!resumeText && !pdfFile)
      return alert("Provide resume text or upload a PDF.");
    if (!jobDesc) return alert("Provide a job description.");

    setLoading(true);
    try {
      let textResume = resumeText;
      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const upload = await fetch("/api/extract-text", {
          method: "POST",
          body: formData,
        });
        const res = await upload.json();
        textResume = res.text;
      }

      const response = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: textResume,
          jobDescription: jobDesc,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate tailored resume");
      const data = await response.json();
      setTailoredResume(data.tailoredResume || "No output received.");
    } catch (err) {
      console.error(err);
      alert("Error generating tailored resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeText("");
    setJobDesc("");
    setTailoredResume("");
    setPdfFile(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/sign-in");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-8 bg-gradient-to-br from-[#4a2574] to-[#0f0529] text-white relative">
      {/* ✅ Profile Icon with Dropdown */}
      <div className="absolute top-6 right-6">
        <div className="relative">
          <User
            className="w-8 h-8 cursor-pointer hover:text-[#F8B55F] border border-white rounded-full p-1"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg p-3 z-50">
              <p className="text-sm mb-2 font-medium">{userEmail}</p>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-red-600 hover:bg-gray-100 px-2 py-1 rounded-md"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BrainCircuit className="w-7 h-7" /> Tailor Your Resume
      </h1>

      {/* ✅ Existing Content */}
      <div className="w-full max-w-2xl space-y-6 bg-white/5 p-6 rounded-2xl shadow-lg">
        {/* Resume Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Step 1: Provide Your Resume
          </h2>
          <p className="text-white/70 text-sm mb-3">
            You can either paste your resume text or upload a PDF file.
          </p>

          <Label className="block mb-1">Paste Resume Text</Label>
          <Textarea
            className="w-full bg-white/10 text-white p-3 rounded-md mb-4"
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume here..."
          />

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-3 text-white/50 text-sm">OR</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Label
              htmlFor="pdf-upload"
              className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-[#F8B55F] text-[#4a2574] rounded-lg hover:bg-white transition"
            >
              <Upload className="w-4 h-4" /> Upload Resume PDF
            </Label>
            <Input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={handlePdfSelect}
              className="hidden"
            />
            {pdfFile && (
              <div className="mt-1 text-sm text-white/80 flex items-center gap-2">
                📄 {pdfFile.name}
                <X
                  className="w-4 h-4 text-red-400 cursor-pointer"
                  onClick={() => {
                    setPdfFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Job Description Section */}
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Step 2: Provide Job Description
          </h2>
          <p className="text-white/70 text-sm mb-3">
            Paste the job description below.
          </p>
          <Textarea
            className="w-full bg-white/10 text-white p-3 rounded-md"
            rows={4}
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here..."
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          className="w-full bg-[#F8B55F] text-[#4a2574] hover:bg-white py-3 text-lg"
        >
          {loading ? (
            <Loader className="animate-spin" />
          ) : (
            "Generate Tailored Resume"
          )}
        </Button>
        <Button
          className="w-full bg-[#F8B55F] text-[#4a2574] hover:bg-white py-3 text-lg"
          onClick={handleClear}
        >
          Clear
        </Button>
      </div>

      {/* Tailored Resume Output */}
      {tailoredResume && (
        <div className="mt-8 w-full max-w-2xl bg-white/10 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-2">Tailored Resume</h2>
          <pre className="whitespace-pre-wrap text-white/90">
            {tailoredResume}
          </pre>
        </div>
      )}
    </div>
  );
}
