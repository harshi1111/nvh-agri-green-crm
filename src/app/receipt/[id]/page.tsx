"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";

type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  payment_mode: string;
  invoice_no: string | null;
  bank_name: string | null;
  cheque_no: string | null;
  ifsc_code: string | null;
  cheque_date: string | null;
  account_no: string | null;
  created_at: string;
  customer?: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
};

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
};

export default function InvoicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        console.log(`🔍 Fetching payment receipt for ID: ${id}`);
        const res = await fetch(`/api/payments/${id}`);
        const data = await res.json();
        
        console.log("📦 Payment API response:", data);
        
        if (!res.ok) {
          setError(data.error ?? "Failed to load payment receipt");
        } else {
          setInvoice(data);
          if (data.customer) {
            console.log("👤 Customer data found:", data.customer);
            setCustomer({
              id: data.customer_id,
              name: data.customer.name,
              email: data.customer.email,
              phone: data.customer.phone,
              address: data.customer.address
            });
          } else {
            setCustomer({
              id: data.customer_id,
              name: "Customer",
              email: null,
              phone: null,
              address: null
            });
          }
        }
      } catch (err) {
        console.error("💥 Payment receipt fetch error:", err);
        setError("Unexpected error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Company details
  const companyName = "NVH AGRI GREEN";
  const companyAddress = `Kamatchi Flats<br>5th Street, Jayalakshmi Nagar,<br>Kattupakkam,<br>Chennai - 600056`;
  const companyPhone = "9841565965";
  const companyEmail = "vharadharajharshitha@gmail.com";

  // Derived values
  const paymentMode = invoice?.payment_mode && invoice.payment_mode.length > 0
    ? invoice.payment_mode.toUpperCase()
    : "CASH";

  const customerName = customer?.name || "Customer";
  const customerPhone = customer?.phone || "";
  const customerEmail = customer?.email || "";
  const customerAddress = customer?.address || "";

  async function downloadPDF() {
    if (!invoice || !invoiceRef.current) {
      alert("No payment receipt data");
      return;
    }

    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");

      // FIXED: Adjusted scaling for better spacing
      const SCALE_FACTOR = 1.2; // Reduced for less congestion
      const scalePx = (px: number) => `${Math.round(px * SCALE_FACTOR)}px`;
      const scaleNum = (num: number) => Math.round(num * SCALE_FACTOR);

      let chequeDetails = "";
      if (invoice.payment_mode === "cheque" && invoice.cheque_no) {
        chequeDetails = `
          <div style="margin-top: ${scaleNum(6)}px; font-size: ${scalePx(10)}; color: #374151;">
            <div><strong>Cheque No:</strong> ${invoice.cheque_no}</div>
            ${
              invoice.bank_name
                ? `<div><strong>Bank:</strong> ${invoice.bank_name}</div>`
                : ""
            }
            ${
              invoice.cheque_date
                ? `<div><strong>Cheque Date:</strong> ${new Date(
                    invoice.cheque_date
                  ).toLocaleDateString("en-IN")}</div>`
                : ""
            }
          </div>
        `;
      }

      if (invoice.payment_mode === "bank" && invoice.bank_name) {
        chequeDetails = `
          <div style="margin-top: ${scaleNum(6)}px; font-size: ${scalePx(10)}; color: #374151;">
            <div><strong>Bank:</strong> ${invoice.bank_name}</div>
            ${
              invoice.account_no && invoice.account_no.length >= 4
                ? `<div><strong>A/c:</strong> ****${invoice.account_no.slice(
                    -4
                  )}</div>`
                : invoice.account_no
                ? `<div><strong>A/c:</strong> ${invoice.account_no}</div>`
                : ""
            }
          </div>
        `;
      }

      const isolatedReceipt = document.createElement("div");
      
      // FIXED: Increased height for less congestion
      const receiptWidth = 180; // mm
      const receiptHeight = 260; // mm
      
      // FIXED: Use relative paths for images (no window.location)
      const logoUrl = "/logo alone.png";
      const logoTextUrl = "/logo text alone.png";
      const signatureUrl = "/signature.png";
      
      isolatedReceipt.innerHTML = `
        <div style="
          background: white;
          font-family: 'Arial', sans-serif;
          color: #000000;
          width: ${receiptWidth}mm;
          height: ${receiptHeight}mm;
          box-sizing: border-box;
          margin: 0;
          border: ${scaleNum(2)}px solid #065f46;
          position: relative;
          overflow: hidden;
        ">
          <div style="padding: ${scaleNum(15)}px ${scaleNum(12)}px ${scaleNum(12)}px ${scaleNum(12)}px; height: 100%;">
            <!-- Header - FIXED: Reduced congestion -->
            <div style="
              margin-bottom: ${scaleNum(12)}px;
              padding-bottom: ${scaleNum(8)}px;
              border-bottom: ${scaleNum(2)}px solid #065f46;
            ">
              <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: ${scaleNum(10)}px;">
                <!-- Logo and Company Name - FIXED: Less congested -->
                <div style="display: flex; flex-direction: column; align-items: flex-start; gap: ${scaleNum(6)}px; min-width: ${scaleNum(180)}px;">
                  <div style="display: flex; align-items: center; gap: ${scaleNum(8)}px;">
                    <div style="flex-shrink: 0;">
                      <!-- Use actual logo image -->
                      <img src="/logo alone.png" style="width: ${scaleNum(70)}px; height: ${scaleNum(70)}px; object-fit: contain;" alt="Logo" />
                    </div>
                    
                    <!-- FIXED: Company name without highlighting -->
                    <div style="flex-shrink: 0;">
                      <div style="font-size: ${scalePx(14)}; font-weight: 800; color: #065f46; line-height: 1.2;">
                        NVH AGRI GREEN
                      </div>
                      <div style="font-size: ${scalePx(9)}; color: #047857; font-weight: 600; margin-top: ${scaleNum(2)}px;">
                        Stronger roots - Stronger Future
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Contact Info - FIXED: Better spacing -->
                <div style="text-align: right; min-width: ${scaleNum(120)}px;">
                  <div style="font-size: ${scalePx(8)}; line-height: 1.3;">
                    <div style="font-weight: 600; color: #374151; text-align: right; margin-bottom: ${scaleNum(4)}px;">
                      Kamatchi Flats<br>
                      5th Street, Jayalakshmi Nagar,<br>
                      Kattupakkam<br>
                      Chennai - 600056
                    </div>
                    <div style="font-weight: 600; color: #065f46; text-align: right; font-size: ${scalePx(8)};">
                      <div style="margin-bottom: ${scaleNum(2)}px;">${companyPhone}</div>
                      <div style="word-break: break-all;">${companyEmail}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Receipt Header - FIXED: Better spacing -->
            <div style="
              background: #ecfdf5;
              border: ${scaleNum(1.5)}px solid #10b981;
              border-radius: ${scaleNum(4)}px;
              padding: ${scaleNum(8)}px ${scaleNum(12)}px;
              margin-bottom: ${scaleNum(15)}px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            ">
              <div>
                <div style="font-size: ${scalePx(16)}; font-weight: 800; color: #065f46;">
                  PAYMENT RECEIPT
                </div>
              </div>

              <div style="text-align: right; font-size: ${scalePx(10)};">
                <div style="margin-bottom: ${scaleNum(3)}px;"><strong>Receipt No:</strong> ${
                  invoice.invoice_no ||
                  `REC-${invoice.id?.slice(0, 8)?.toUpperCase() || "N/A"}`
                }</div>
                <div><strong>Date:</strong> ${
                  invoice.created_at
                    ? new Date(invoice.created_at).toLocaleDateString("en-IN")
                    : new Date().toLocaleDateString("en-IN")
                }</div>
              </div>
            </div>

            <!-- Customer Details - FIXED: Better layout -->
            <div style="
              margin-bottom: ${scaleNum(15)}px;
              padding: ${scaleNum(10)}px ${scaleNum(12)}px;
              border: ${scaleNum(1)}px solid #d1fae5;
              border-radius: ${scaleNum(4)}px;
              background: #f0fdf4;
            ">
              <div style="font-size: ${scalePx(12)}; font-weight: 700; color: #065f46; margin-bottom: ${scaleNum(8)}px; padding-bottom: ${scaleNum(4)}px; border-bottom: ${scaleNum(1)}px solid #10b981;">
                CUSTOMER DETAILS
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: ${scaleNum(15)}px;">
                <!-- Left Column -->
                <div style="font-size: ${scalePx(10)};">
                  <div style="margin-bottom: ${scaleNum(8)}px;">
                    <div style="color: #374151; margin-bottom: ${scaleNum(3)}px; font-size: ${scalePx(9)};"><strong>Name:</strong></div>
                    <div style="font-weight: 600; color: #111827; font-size: ${scalePx(11)};">${customerName}</div>
                  </div>
                  ${
                    customerPhone
                      ? `
                  <div>
                    <div style="color: #374151; margin-bottom: ${scaleNum(3)}px; font-size: ${scalePx(9)};"><strong>Phone:</strong></div>
                    <div style="color: #111827; font-size: ${scalePx(11)};">${customerPhone}</div>
                  </div>
                  `
                      : ""
                  }
                </div>
                
                <!-- Right Column -->
                <div style="font-size: ${scalePx(10)};">
                  ${
                    customerEmail
                      ? `
                  <div style="margin-bottom: ${scaleNum(8)}px;">
                    <div style="color: #374151; margin-bottom: ${scaleNum(3)}px; font-size: ${scalePx(9)};"><strong>Email:</strong></div>
                    <div style="color: #111827; font-size: ${scalePx(10)}; word-break: break-all;">${customerEmail}</div>
                  </div>
                  `
                      : ""
                  }
                  ${
                    customerAddress
                      ? `
                  <div>
                    <div style="color: #374151; margin-bottom: ${scaleNum(3)}px; font-size: ${scalePx(9)};"><strong>Address:</strong></div>
                    <div style="color: #111827; font-size: ${scalePx(10)};">${customerAddress}</div>
                  </div>
                  `
                      : ""
                  }
                </div>
              </div>
              ${chequeDetails}
            </div>

            <!-- Payment Table -->
            <div style="margin-bottom: ${scaleNum(15)}px;">
              <table style="
                width: 100%;
                font-size: ${scalePx(10)};
                border-collapse: collapse;
                border: ${scaleNum(2)}px solid #065f46;
                border-radius: ${scaleNum(4)}px;
                overflow: hidden;
              ">
                <thead>
                  <tr style="background: #065f46; color: white;">
                    <th style="text-align: left; padding: ${scaleNum(10)}px; font-weight: 700; font-size: ${scalePx(12)};">DESCRIPTION</th>
                    <th style="text-align: right; padding: ${scaleNum(10)}px; font-weight: 700; font-size: ${scalePx(12)};">AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="padding: ${scaleNum(12)}px; border-bottom: ${scaleNum(1)}px solid #d1fae5; background: #f0fdf4;">
                      <div style="font-weight: 700; font-size: ${scalePx(12)}; color: #065f46; margin-bottom: ${scaleNum(4)}px;">
                        Payment Received for vettiver and services
                      </div>
                      <div style="font-size: ${scalePx(10)}; color: #047857;">
                        <strong>Payment Mode:</strong> ${paymentMode}
                      </div>
                    </td>
                    <td style="
                      text-align: right;
                      padding: ${scaleNum(12)}px;
                      font-family: 'Courier New', monospace;
                      font-weight: 800;
                      font-size: ${scalePx(14)};
                      color: #065f46;
                      border-bottom: ${scaleNum(1)}px solid #d1fae5;
                      background: #f0fdf4;
                    ">₹${invoice.amount?.toFixed(2) || "0.00"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total Section -->
            <div style="margin-bottom: ${scaleNum(20)}px;">
              <div style="
                display: flex;
                justify-content: space-between;
                padding: ${scaleNum(12)}px ${scaleNum(14)}px;
                background: #065f46;
                border-radius: ${scaleNum(4)}px;
                color: white;
                font-size: ${scalePx(13)};
                font-weight: 800;
              ">
                <span>TOTAL RECEIVED:</span>
                <span>₹${invoice.amount?.toFixed(2) || "0.00"}</span>
              </div>
              <div style="text-align: right; margin-top: ${scaleNum(6)}px; font-size: ${scalePx(10)}; color: #374151; padding: 0 ${scaleNum(14)}px; font-weight: 600;">
                <strong>Amount in Words:</strong> ${
                  invoice.amount
                    ? amountInWords(invoice.amount)
                    : "Zero Rupees Only"
                }
              </div>
            </div>

            <!-- Signature - FIXED: Simple signature area -->
            <div style="
              position: absolute;
              bottom: ${scaleNum(45)}px;
              right: ${scaleNum(12)}px;
              text-align: right;
            ">
              <div style="margin-bottom: ${scaleNum(4)}px;">
                <!-- Use actual signature image -->
                <img src="/signature.png" style="width: ${scaleNum(120)}px; height: ${scaleNum(40)}px; object-fit: contain;" alt="Signature" />
              </div>
              <div style="
                height: ${scaleNum(1)}px;
                border-bottom: ${scaleNum(1)}px solid #374151;
                margin-bottom: ${scaleNum(4)}px;
                width: ${scaleNum(100)}px;
                margin-left: auto;
              "></div>
              <div style="text-align: right; font-size: ${scalePx(9)}; color: #374151; font-weight: 600;">
                Authorized Signatory
              </div>
            </div>

            <!-- Footer -->
            <div style="
              position: absolute;
              bottom: ${scaleNum(10)}px;
              left: 0;
              right: 0;
              padding-top: ${scaleNum(10)}px;
              border-top: ${scaleNum(1)}px solid #d1d5db;
              text-align: center;
              font-size: ${scalePx(12)};
              font-weight: 700;
              color: #065f46;
            ">
              <div>Thank you!</div>
            </div>
          </div>
        </div>
      `;

      // Append to body for rendering
      document.body.appendChild(isolatedReceipt);
      isolatedReceipt.style.position = 'absolute';
      isolatedReceipt.style.left = '-9999px';
      isolatedReceipt.style.top = '0';

      // Render to canvas with higher scale for better quality
      const canvas = await html2canvas(isolatedReceipt, {
        scale: 2, // Reduced scale for better performance
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: receiptWidth * 3.78,
        height: receiptHeight * 3.78,
      });

      // Clean up
      document.body.removeChild(isolatedReceipt);

      // Create PDF
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Calculate dimensions to fit on A4
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15; // 15mm margin for better spacing
      
      // Calculate scaling to fit the receipt within margins
      const availableWidth = pageWidth - (margin * 2);
      const availableHeight = pageHeight - (margin * 2);
      
      const scale = Math.min(
        availableWidth / receiptWidth,
        availableHeight / receiptHeight
      );
      
      const finalWidth = receiptWidth * scale;
      const finalHeight = receiptHeight * scale;
      
      // Center on page
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight);
      
      // Save PDF
      const fileName = `Payment_Receipt_${
        invoice.invoice_no || invoice.id?.slice(0, 8) || "receipt"
      }.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("PDF ERROR:", err);
      alert(`PDF generation failed: ${err}`);
    } finally {
      setDownloading(false);
    }
  }

  function amountInWords(amount: number): string {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    if (amount === 0) return "Zero Rupees Only";

    let rupees = Math.floor(amount);
    let paise = Math.round((amount - rupees) * 100);

    let inWords = "";

    if (rupees > 0) {
      if (rupees >= 10000000) {
        inWords += convertCrore(rupees) + " Crore ";
        rupees %= 10000000;
      }
      if (rupees >= 100000) {
        inWords += convertLakh(rupees) + " Lakh ";
        rupees %= 100000;
      }
      if (rupees >= 1000) {
        inWords += convertThousand(rupees) + " Thousand ";
        rupees %= 1000;
      }
      if (rupees >= 100) {
        inWords += convertHundred(rupees) + " Hundred ";
        rupees %= 100;
      }
      if (rupees > 0) {
        inWords += convertTens(rupees);
      }
      inWords += " Rupees";
    }

    if (paise > 0) {
      if (inWords) inWords += " and ";
      inWords += convertTens(paise) + " Paise";
    }

    return inWords + " Only";

    function convertCrore(num: number): string {
      return convertNumber(Math.floor(num / 10000000));
    }
    function convertLakh(num: number): string {
      return convertNumber(Math.floor(num / 100000));
    }
    function convertThousand(num: number): string {
      return convertNumber(Math.floor(num / 1000));
    }
    function convertHundred(num: number): string {
      return convertNumber(Math.floor(num / 100));
    }
    function convertTens(num: number): string {
      if (num < 20) return a[num];
      return (
        b[Math.floor(num / 10)] + (num % 10 ? " " + a[num % 10] : "")
      );
    }
    function convertNumber(num: number): string {
      let words = "";
      if (num >= 100) {
        words += convertHundred(num) + " ";
        num %= 100;
      }
      if (num > 0) {
        words += convertTens(num);
      }
      return words.trim();
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-300">Loading payment receipt…</p>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center">
        <p className="text-sm text-red-300">{error ?? "Payment receipt not found"}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl space-y-8">
        <div
          ref={invoiceRef}
          className="bg-white text-black p-12 lg:p-6 shadow-2xl border-2 border-emerald-900 mx-auto"
          style={{ 
            width: '170mm', 
            minHeight: '240mm'
          }}
        >
          {/* Header */}
          <div className="mb-6 pb-4 border-b-2 border-emerald-800">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-4">
              {/* Logo and Company Name - BIGGER */}
              <div className="flex items-center gap-4">
                {/* BIGGER Logo */}
                <div className="w-20 h-20 relative flex-shrink-0">
                  <Image
                    src="/logo alone.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Company Name - BIGGER */}
                <div className="w-48 h-16 relative">
                  <Image
                    src="/logo text alone.png"
                    alt="NVH AGRI GREEN"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Contact Info - NO HEADINGS */}
              <div className="text-right lg:text-right mt-3 lg:mt-0">
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-gray-700 leading-tight mb-1 text-xs">
                    Kamatchi Flats<br />
                    5th Street, Jayalakshmi Nagar,<br />
                    Kattupakkam,<br />
                    Chennai - 600056
                  </div>
                  <div className="font-semibold text-emerald-800 text-xs space-y-0">
                    <div>
                      {companyPhone}
                    </div>
                    <div>
                      {companyEmail}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Receipt header - SMALLER */}
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg p-3 mb-6 flex flex-col lg:flex-row justify-between items-center">
            <div className="mb-2 lg:mb-0">
              <h2 className="text-lg lg:text-xl font-black text-emerald-900">
                PAYMENT RECEIPT
              </h2>
            </div>
            <div className="text-right text-sm">
              <div className="mb-1">
                <strong>Receipt No:</strong> {invoice.invoice_no || `REC-${invoice.id?.slice(0, 8)?.toUpperCase() || "N/A"}`}
              </div>
              <div>
                <strong>Date:</strong> {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="mb-6 p-3 border border-emerald-200 rounded-lg bg-emerald-50">
            <h3 className="text-sm font-bold text-emerald-900 mb-2 pb-1 border-b border-emerald-300">
              CUSTOMER DETAILS
            </h3>
            <div className="flex flex-col lg:flex-row gap-4">
              {/* LEFT COLUMN: Name and Phone */}
              <div className="flex-1 space-y-3">
                <div>
                  <div className="text-gray-600 mb-1 text-xs"><strong>Name:</strong></div>
                  <div className="font-semibold text-gray-900 text-sm">{customerName}</div>
                </div>
                {customerPhone && (
                  <div>
                    <div className="text-gray-600 mb-1 text-xs"><strong>Phone:</strong></div>
                    <div className="text-gray-900 text-sm">{customerPhone}</div>
                  </div>
                )}
              </div>
              
              {/* RIGHT COLUMN: Email and Address */}
              <div className="flex-1 space-y-3">
                {customerEmail && (
                  <div>
                    <div className="text-gray-600 mb-1 text-xs"><strong>Email:</strong></div>
                    <div className="text-gray-900 text-xs break-words">{customerEmail}</div>
                  </div>
                )}
                {customerAddress && (
                  <div>
                    <div className="text-gray-600 mb-1 text-xs"><strong>Address:</strong></div>
                    <div className="text-gray-900 text-xs">{customerAddress}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Details */}
            {(invoice.payment_mode === "cheque" && invoice.cheque_no) || (invoice.payment_mode === "bank" && invoice.bank_name) ? (
              <div className="mt-4 p-2 bg-amber-50 border border-amber-300 rounded">
                <p className="font-bold text-amber-800 mb-1 text-xs">Payment Details:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
                  {invoice.payment_mode === "cheque" && invoice.cheque_no && (
                    <>
                      <div><strong>Cheque No:</strong> {invoice.cheque_no}</div>
                      {invoice.bank_name && <div><strong>Bank:</strong> {invoice.bank_name}</div>}
                      {invoice.cheque_date && <div><strong>Date:</strong> {new Date(invoice.cheque_date).toLocaleDateString("en-IN")}</div>}
                    </>
                  )}
                  {invoice.payment_mode === "bank" && invoice.bank_name && (
                    <>
                      <div><strong>Bank:</strong> {invoice.bank_name}</div>
                      {invoice.account_no && invoice.account_no.length >= 4 ? (
                        <div><strong>A/c:</strong> ****{invoice.account_no.slice(-4)}</div>
                      ) : invoice.account_no ? (
                        <div><strong>A/c:</strong> {invoice.account_no}</div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Payment table */}
          <div className="mb-6">
            <table className="w-full border-2 border-emerald-800 text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white">
                  <th className="text-left p-2 font-bold text-sm border border-emerald-800">DESCRIPTION</th>
                  <th className="text-right p-2 font-bold text-sm border border-emerald-800">AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-emerald-200 bg-emerald-50">
                    <p className="font-bold text-sm text-emerald-900">
                      Payment Received for vettiver and services
                    </p>
                    <p className="text-emerald-700 mt-0.5 text-xs">
                      <strong>Payment Mode:</strong> {paymentMode}
                    </p>
                  </td>
                  <td className="p-3 text-right border border-emerald-200 bg-emerald-50">
                    <p className="font-black text-lg font-mono text-emerald-900">
                      ₹{invoice.amount?.toFixed(2) || "0.00"}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="mb-8">
            <div className="flex justify-between items-center p-3 bg-emerald-900 border-2 border-emerald-800 rounded-lg text-white">
              <span className="font-black text-base">TOTAL RECEIVED:</span>
              <span className="font-black text-xl">₹${invoice.amount?.toFixed(2) || "0.00"}</span>
            </div>
            <p className="text-right text-xs font-semibold text-gray-700 mt-1 pr-3">
              <strong>Amount in Words:</strong> {invoice.amount ? amountInWords(invoice.amount) : "Zero Rupees Only"}
            </p>
          </div>

          {/* Signature Section */}
          <div className="mt-12 pt-5 border-t border-emerald-800">
            <div className="flex justify-end items-end">
              <div className="text-right">
                <div className="mb-1">
                  <div className="w-36 h-12 relative">
                    <Image
                      src="/signature.png"
                      alt="Signature"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="h-px border-b border-gray-500 mb-1 w-36 ml-auto"></div>
                <div className="text-right text-xs text-gray-600 font-semibold">
                  Authorized Signatory
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-4 border-t border-gray-400 text-center text-base font-bold text-emerald-900">
            <div>Thank you!</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <a
            href="/payments"
            className="px-6 py-3 rounded-lg bg-slate-800 text-slate-50 hover:bg-slate-700 text-sm font-semibold transition text-center"
          >
            ← Back to Payments
          </a>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="px-6 py-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-60 text-sm font-bold transition flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <span className="animate-spin">⏳</span>
                Generating PDF…
              </>
            ) : (
              <>Download Receipt</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}