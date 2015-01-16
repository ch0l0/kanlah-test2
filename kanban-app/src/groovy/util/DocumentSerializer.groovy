package util;

import org.springframework.web.multipart.MultipartFile;
import org.apache.commons.logging.LogFactory;

import java.awt.Graphics2D;
import java.awt.Image;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import javax.servlet.ServletContext

import java.security.MessageDigest
import groovy.util.Eval

public class DocumentSerializer extends FileSerializer {
	private static log = LogFactory.getLog(this);
	public String filename = "";
	public enum PATH { ABSOLUTE, HTTP, RELATIVE };

	private static String[] ext = [];
	private def paths = [ absolute: "", http:"", relative:"" ];
	private String relativePath = "";
	private ServletContext context;
	
	public DocumentSerializer(ServletContext ctx,MultipartFile mfile,def Paths, def sysParam){
		super(mfile, ext);
		extensions = Eval.me("[${sysParam.allowedFileExtensionsAttachment}]");
		maxfilesize = MBToBytes(sysParam.maxFilesizeCardAttachment);	//default is MB
		context = ctx;
		paths = Paths;
	}
	
	/* Public Functions -------------------------------------------------------------------------------------------------------------------------------*/
	public boolean save(){
		boolean result = false;
		try{
			if(super.isValid()){
				String path = getPath(PATH.ABSOLUTE);
				if(super.save(path)){
					result = true;
				}
			}
		}catch(e){
			log.debug(e.getMessage());
			throw new Exception(e.getMessage());
		}
		return result;
	}
	public String getPath(def type){
		filename = uploadedfile.getOriginalFilename();
		switch(type){
			case PATH.ABSOLUTE:
				return paths.absolute + File.separatorChar.toString() + filename;
			case PATH.HTTP:
				return paths.http + "/" + filename;
			case PATH.RELATIVE:
				return paths.relative + "/" + filename;
		}
	}
}
