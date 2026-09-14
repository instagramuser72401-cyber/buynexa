export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">नियम एवं शर्तें / Terms & Conditions</h1>

      <section className="rounded-2xl border p-5 mb-6">
        <h2 className="text-2xl font-bold mb-4">नियम एवं शर्तें — हिंदी</h2>

        <ol className="list-decimal pl-5 space-y-4 text-gray-700">
          <li>
            <strong>उत्पाद की कीमत और डिलीवरी शुल्क:</strong> वेबसाइट पर उत्पाद के साथ
            दिखाई गई कीमत ही ग्राहक की अंतिम भुगतान राशि होगी। डिलीवरी शुल्क उसी
            कीमत में शामिल है। उदाहरण: उत्पाद ₹399 है, तो कुल भुगतान ₹399 ही होगा।
          </li>

          <li>
            <strong>ऑर्डर रद्द करने का शुल्क:</strong> ऑर्डर रद्द करने पर ₹59
            डिलीवरी/कैंसिलेशन शुल्क अनिवार्य होगा। कैंसिल करने से पहले ₹59 का भुगतान
            करके Transaction ID / UTR देना होगा।
          </li>

          <li>
            <strong>ऑनलाइन भुगतान:</strong> Online/QR payment में ग्राहक को ऑर्डर
            में दिखाई गई पूरी अंतिम राशि ही QR के माध्यम से भुगतान करनी होगी।
          </li>

          <li>
            <strong>Cash on Delivery:</strong> COD ऑर्डर में ग्राहक को डिलीवरी के
            समय ऑर्डर की पूरी अंतिम राशि का भुगतान करना होगा।
          </li>

          <li>
            <strong>सही जानकारी देना अनिवार्य:</strong> ग्राहक को अपना सही नाम,
            मोबाइल नंबर और पूरा डिलीवरी पता देना आवश्यक है।
          </li>

          <li>
            <strong>ऑर्डर की पुष्टि:</strong> सही डिलीवरी जानकारी की पुष्टि और
            सफल ऑर्डर प्लेस होने के बाद ऑर्डर को PLACED माना जाएगा।
          </li>

          <li>
            <strong>No Return:</strong> खरीदा गया उत्पाद Return के लिए योग्य नहीं
            है। ऑर्डर करने से पहले ग्राहक को उत्पाद और उसकी जानकारी ध्यान से जांचनी
            चाहिए।
          </li>

          <li>
            <strong>कैंसिलेशन की समय-सीमा:</strong> ऑर्डर केवल PLACED status में
            कैंसिल किया जा सकता है। अन्य status में cancellation उपलब्ध नहीं हो
            सकती।
          </li>

          <li>
            <strong>₹59 भुगतान का प्रमाण:</strong> cancellation के समय ₹59 payment
            का Transaction ID / UTR देना अनिवार्य है।
          </li>

          <li>
            <strong>भुगतान राशि की जिम्मेदारी:</strong> भुगतान करने से पहले ग्राहक
            को दिखाई गई final payable amount अवश्य जांचनी चाहिए। गलत राशि का भुगतान
            करने की जिम्मेदारी ग्राहक की होगी।
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border p-5 mb-6">
        <h2 className="text-2xl font-bold mb-4">Terms & Conditions — English</h2>

        <ol className="list-decimal pl-5 space-y-4 text-gray-700">
          <li>
            <strong>Product Price and Delivery Charge:</strong> The price displayed
            with the product is the customer&apos;s final payable amount. The
            delivery charge is already included in that price. Example: If the
            product price is ₹399, the total payable amount is ₹399.
          </li>

          <li>
            <strong>Order Cancellation Charge:</strong> A ₹59 delivery/cancellation
            charge is compulsory when an order is cancelled. Before cancellation,
            the customer must pay ₹59 and submit the Transaction ID / UTR.
          </li>

          <li>
            <strong>Online Payment:</strong> For Online/QR payment, the customer
            must pay exactly the final amount displayed for the order through the
            provided QR code.
          </li>

          <li>
            <strong>Cash on Delivery:</strong> For COD orders, the customer must
            pay the complete final order amount at the time of delivery.
          </li>

          <li>
            <strong>Accurate Information Required:</strong> Customers must provide
            a correct name, mobile number and complete delivery address.
          </li>

          <li>
            <strong>Order Confirmation:</strong> After confirming the delivery
            details and successfully placing the order, the order will be treated
            as PLACED.
          </li>

          <li>
            <strong>No Return:</strong> Purchased products are not eligible for
            return. Customers should carefully check the product and its details
            before placing an order.
          </li>

          <li>
            <strong>Cancellation Time Limit:</strong> An order can be cancelled
            only while its status is PLACED. Cancellation may not be available for
            other statuses.
          </li>

          <li>
            <strong>Proof of ₹59 Payment:</strong> A Transaction ID / UTR for the
            ₹59 cancellation payment is compulsory at the time of cancellation.
          </li>

          <li>
            <strong>Payment Responsibility:</strong> Customers must check the final
            payable amount before making payment. The customer is responsible for
            any incorrect payment amount.
          </li>
        </ol>
      </section>

      <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h2 className="text-xl font-bold mb-4">3-Line Summary</h2>
        <p className="font-semibold">₹399 Product = ₹399 Final Payable — Delivery Charge Included.</p>
        <p className="font-semibold mt-2">Normal Order पर कोई Extra ₹59 Delivery Charge नहीं लगेगा.</p>
        <p className="font-semibold mt-2">Order Cancel करने पर ₹59 Cancellation/Delivery Charge अनिवार्य है.</p>
      </section>
    </main>
  );
}
