package util;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.apache.commons.logging.LogFactory;
import javax.servlet.ServletContext
import java.security.MessageDigest
import java.nio.file.*

public class FileSerializer {
	private static log = LogFactory.getLog(this);
	public String filename = "";
	public enum PATH { ABSOLUTE, HTTP, RELATIVE }
	
	protected CommonsMultipartFile uploadedfile;
	protected File file;
	protected double maxfilesize = 2097152;	//2MB
	protected String[] extensions = [];
	protected String extension = "";
	protected double size;
	
	public FileSerializer(MultipartFile mfile, String[] ext){
		uploadedfile = (CommonsMultipartFile)mfile;
		extensions = ext;
	}
	
	/* Protected Functions -------------------------------------------------------------------------------------------------------------------------------*/
	protected boolean save(String path){
		boolean result = false;
		try{
			file = new File(path);
			file.mkdirs();
			uploadedfile.transferTo(file);
			result = true;
		}catch(e){
			log.debug(e.getMessage());
			throw new Exception(e.getMessage());
		}
		return result;
	}
	protected boolean isValid(){
		if(uploadedfile != null && !uploadedfile.isEmpty()){
			if(validateSize() && validateExtension()){
				return true;
			}
		}
		return false;
	}
	protected static String getMD5Hash(String value) {
		MessageDigest digest = MessageDigest.getInstance("MD5")
		digest.update(value.bytes);
		new BigInteger(1, digest.digest()).toString(16).padLeft(32, '0')
	}
	protected static delete(String path){
		try {
			def tmp = new File(path)
			if(tmp.exists())
				tmp.delete();
		} catch (e) {
			throw new Exception(e.getMessage());
		}
	}
	protected static deleteDirectory(File folder){
		try {
			File[] files = folder.listFiles();
			if(files!=null) {
				for(File f: files) {
					if(f.isDirectory()) {
						deleteDirectory(f);
					} else {
						f.delete();
					}
				}
			}
			folder.delete();
		} catch (e) {
			throw new Exception(e.getMessage());
		}
	}
	protected static MBToBytes(val){
		return Double.parseDouble(val.toString()) * 1048576
	}
	/* Private Functions -------------------------------------------------------------------------------------------------------------------------------*/
	private boolean validateSize(){
		size = uploadedfile.getBytes().length;
		if(size <= maxfilesize){
			return true
		}
		throw new Exception("Exceed maximum file size.");
		return false
	}
	private boolean validateExtension(){
		String originalname = uploadedfile.getOriginalFilename();
		boolean result = false;
		int index = originalname.lastIndexOf(".");
		if (index != -1){
			extension = originalname.substring(index).toString();
			extensions.each {
				if(it.toLowerCase() == extension.toLowerCase() || it.toLowerCase() == "*"){
					result = true
				}
			}
		}
		if(!result)
			throw new Exception("Invalid extension.");
		return result
	}
}
