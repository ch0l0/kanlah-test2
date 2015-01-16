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

public class ImageSerializer extends FileSerializer {
	private static log = LogFactory.getLog(this);
	public String filename = "";
	public enum PATH { ABSOLUTE, HTTP, RELATIVE };

	private static String[] ext = [];
	private int resizeMinPixel = 200;	//in pixels (either width or height)

	private def paths = [ absolute: "", http:"", relative:"", original:"", thumbnail:"" ];
	private String filenameHash = "";
	private ServletContext context;
	
	public ImageSerializer(ServletContext ctx, MultipartFile mfile, String uniqueId, def Paths, def sysParam){
		super(mfile, ext);

		filenameHash = getMD5Hash(uniqueId);
		maxfilesize = MBToBytes(sysParam.maxFilesizeAvatar);
		resizeMinPixel = sysParam.resizeMinPixelAvatar;
		extensions = Eval.me("[${sysParam.allowedFileExtensionsAvatar}]");
		context = ctx;
		paths = Paths;
	}
	
	/* Public Functions -------------------------------------------------------------------------------------------------------------------------------*/
	public boolean save(){
		boolean result = false;
		try{
			if(super.isValid()){
				String path = getPath(PATH.ABSOLUTE,false);
				deleteDirectory(new File(getPath(PATH.ABSOLUTE,false)).getParentFile().getParentFile())
				if(super.save(path)){
					saveAsThumbnail(file, resizeMinPixel);
					result = true;
				}
			}
		}catch(e){
			log.debug(e.getMessage());
			throw new Exception(e.getMessage());
		}
		return result;
	}
	public String getPath(def type, boolean isThumbnail){
		String directory = isThumbnail ? paths.thumbnail : paths.original;
		filename = filenameHash + extension;
		switch(type){
			case PATH.ABSOLUTE:
				return paths.absolute + File.separatorChar.toString() + directory + File.separatorChar.toString() + filename;
			case PATH.HTTP:
				return paths.http + "/" + directory + "/" + filename;
			case PATH.RELATIVE:
				return paths.relative + "/" + directory + "/" + filename;
		}
	}
	/* Private Functions -------------------------------------------------------------------------------------------------------------------------------*/
	private saveAsThumbnail(file, minPixel){
		try{
			BufferedImage sourceImg = ImageIO.read(file);
			BufferedImage resizedImage = resize(sourceImg, minPixel);
			if(resizedImage != null){
				File tmpFile = new File(getPath(PATH.ABSOLUTE, true));
				tmpFile.mkdirs();
				ImageIO.write(resizedImage, extension.replace('.', ''), tmpFile)
				return true;
			}
		}catch(e){
			log.debug(e.getMessage());
			return false;
		}
		return false;
	}
	private BufferedImage resize(BufferedImage img, minPixel){
		try{
			double scale = getScale(minPixel, img.getWidth(), img.getHeight());
			int newWidth = img.getWidth() * scale;
			int newHeight = img.getHeight() * scale;
			
			BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, img.type);
			Graphics2D g = resizedImage.createGraphics();
			g.drawImage(img, 0, 0, newWidth, newHeight, null);
			g.dispose();
			return resizedImage;
		}catch(e){
			log.debug(e.getMessage());
			return;
		}
	}
	private double getScale(min, width, height){
		double scale = 1;
		double tmp = width > height ? height : width;
		if(tmp > min){
			scale = (double)min / tmp;
		}
		return scale;
	} 
}
