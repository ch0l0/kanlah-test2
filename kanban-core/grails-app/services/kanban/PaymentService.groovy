package kanban

import kanban.old.checkout.Purchase;

class PaymentService {

    def payOk() {
		return true
    }
	
	def dummyPurchase() {
		def purchase = new Purchase()
		
		purchase.merchantid = "testmid"
		purchase.password = "Password1!"
		purchase.action = 1
		purchase.trackid = "1122-001"
		purchase.bill_currencycode = "USD"
		purchase.bill_cardholder = "CASH CUSTOMER"
		purchase.bill_cc_type = "CC"
		purchase.bill_cc_brand = "VC"
		purchase.bill_cc = "4444444444444444"
		purchase.bill_expmonth = "08"
		purchase.bill_expyear = 2009
		purchase.bill_cvv2 = "208"
		purchase.bill_address = "Billing Address"
		purchase.bill_address2 = "Billing Address 2"
		purchase.bill_postal = "Billing Postal"
		purchase.bill_city = "Billing city"
		purchase.bill_state = "Billing state"
		purchase.bill_email = "email@domain.com"
		purchase.bill_country = "USA"
		purchase.bill_amount = 0.01
		purchase.bill_phone = "44-12312331312"
		purchase.bill_fax = "44-12312331312"
		purchase.bill_customerip = "123.123.123.200"
		purchase.bill_merchantip = "192.168.5.5"
		purchase.ship_address = "Shipping address"
		purchase.ship_email = "email@shipping.com"
		purchase.ship_postal = "Shipping Postal Code"
		purchase.ship_address2 = "Shipping Address 2"
		purchase.ship_type = "FEDEX"
		purchase.ship_city = "Shipping City"
		purchase.ship_state = "Shipping State"
		purchase.ship_phone = "44-12312331312"
		purchase.ship_country = "USA"
		purchase.ship_fax = "44-12312331312"
		
		purchase
	}
}
