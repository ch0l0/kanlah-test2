package kanban.old.checkout

class Purchase {
	String account_identifier
	String merchantid
	String password
	Integer action
	String trackid
	String bill_currencycode
	String bill_cardholder
	String bill_cc_type
	String bill_cc_brand
	String bill_cc
	String bill_expmonth
	Integer bill_expyear
	String bill_cvv2
	String bill_address
	String bill_address2
	String bill_postal
	String bill_city
	String bill_state
	String bill_email
	String bill_country
	Double bill_amount
	String bill_phone
	String bill_fax
	String bill_customerip
	String bill_merchantip
	String ship_address
	String ship_email
	String ship_postal
	String ship_address2
	String ship_type
	String ship_city
	String ship_state
	String ship_phone
	String ship_country
	String ship_fax
	String udf1
	String udf2
	String udf3
	String udf4
	String udf5
	String merchantcustomerid
	String product_desc
	String product_quantity
	String product_unitcost
	String xid
	String ecivalue
	String cavv
	
    static constraints = {
		account_identifier blank:true, nullable: true
		ship_address blank:true, nullable: true
		ship_email blank:true, nullable: true
		ship_postal blank:true, nullable: true
		ship_address2 blank:true, nullable: true
		ship_type blank:true, nullable: true
		ship_city blank:true, nullable: true
		ship_state blank:true, nullable: true
		ship_phone blank:true, nullable: true
		ship_country blank:true, nullable: true
		ship_fax blank:true, nullable: true
		udf1 blank:true, nullable: true
		udf2 blank:true, nullable: true
		udf3 blank:true, nullable: true
		udf4 blank:true, nullable: true
		udf5 blank:true, nullable: true
		merchantcustomerid blank:true, nullable: true
		product_desc blank:true, nullable: true
		product_quantity blank:true, nullable: true
		product_unitcost blank:true, nullable: true
		xid blank:true, nullable: true
		ecivalue blank:true, nullable: true
		cavv blank:true, nullable: true
    }
}
