/**
 * Fawaterk Service Core
 * A reusable logic for interacting with Fawaterk API v2.
 */

class FawaterkService {
  /**
   * @param {string} apiKey - Your Fawaterk API Key
   * @param {boolean} isSandbox - Use staging environment if true
   */
  constructor(apiKey, isSandbox = true) {
    this.apiKey = apiKey;
    this.baseUrl = isSandbox
      ? "https://app.fawaterk.com/api/v2"
      : "https://fawaterk.com/api/v2";
  }

  /**
   * Create an invoice link (Send Payment)
   * @param {Object} payload - The invoice data
   * @returns {Promise<Object>}
   */
  async createInvoice(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/createInvoiceLink`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Fawaterk createInvoice Error:", error);
      return { status: "error", message: error.message };
    }
  }

  /**
   * Get transaction/invoice data
   * @param {string|number} invoiceId - The ID of the invoice
   * @returns {Promise<Object>}
   */
  async getInvoiceData(invoiceId) {
    try {
      const response = await fetch(
        `${this.baseUrl}/getInvoiceData/${invoiceId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
        },
      );

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Fawaterk getInvoiceData Error:", error);
      return { status: "error", message: error.message };
    }
  }
}

export default FawaterkService;
