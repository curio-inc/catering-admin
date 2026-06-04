/** ブラウザ上で請求書 DOM を PDF 化してダウンロード（デモ・印刷画面用） */

export function buildInvoicePdfDownloadName(
  brandName: string,
  orderNumber: string | null,
  orderId: string,
): string {
  const raw = orderNumber?.trim() || orderId.slice(0, 8)
  const safe = raw.replace(/[\\/:*?"<>|]/g, "_")
  return `【${brandName}】ご請求書_${safe}.pdf`
}

const A4_WIDTH_MM = 210
const A4_HEIGHT_MM = 297
const PDF_MARGIN_MM = 0

export async function downloadInvoicePdfFromElement(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ])

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  })

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  const maxWidth = A4_WIDTH_MM - PDF_MARGIN_MM * 2
  const maxHeight = A4_HEIGHT_MM - PDF_MARGIN_MM * 2

  let drawWidth = maxWidth
  let drawHeight = (canvas.height * drawWidth) / canvas.width

  if (drawHeight > maxHeight) {
    drawHeight = maxHeight
    drawWidth = (canvas.width * drawHeight) / canvas.height
  }

  const offsetX = PDF_MARGIN_MM + (maxWidth - drawWidth) / 2
  const offsetY = PDF_MARGIN_MM

  pdf.addImage(imgData, "PNG", offsetX, offsetY, drawWidth, drawHeight)
  pdf.save(filename)
}
