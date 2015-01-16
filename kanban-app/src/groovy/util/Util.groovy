package util;

import org.apache.commons.lang.RandomStringUtils;

public class Util {

	static def generateActivationCode(){
		String charset = (('A'..'Z') + ('0'..'0')).join()
		Integer length = 9
		return RandomStringUtils.random(length, charset.toCharArray())
	}
}
