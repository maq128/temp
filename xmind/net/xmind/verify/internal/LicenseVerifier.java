package net.xmind.verify.internal;

import net.xmind.verify.IValidity;
import net.xmind.verify.IVerifyListener;
import net.xmind.signin.IAuthenticationListener;
import net.xmind.signin.IXMindNetCommandHandler;
import net.xmind.signin.IXMindNetCommand;
import net.xmind.signin.IAccountInfo;
import net.xmind.signin.ILicenseKeyHeader;

public class LicenseVerifier implements IAuthenticationListener, IXMindNetCommandHandler
{
	private static LicenseVerifier INSTANCE = null;
	private IValidity validity;

	public static LicenseVerifier getInstance()
	{
		if (INSTANCE == null) {
			INSTANCE = new LicenseVerifier();
		}
		return INSTANCE;
	}

	private LicenseVerifier()
	{
		int severity = 0;
		String pluginId = "net.xmind.verify";
		int code = 2; // 1:free / 2:Pro / 4:Plus
		String message = null;
		Throwable exception = null;
		String licensedTo = "nobody@xmind.net";
		/*
			header 固定由 12 个字符组成：
				0	: 必须是 'X'
				1	: type，
						A: Pro
						B: Plus
						C: VLE
				2-3	: vendorName
				4	: majorVersion
				5	: minorVersion
				6	: licenseeType
				7-8	: yearsOfUpgrade
				9	: freeMonths 可参考 LicenseKeyHeader.decodeFreeMonthsFromHeader()
				10-11: 最后两个字符似乎无所谓
		*/
		ILicenseKeyHeader licenseKeyHeader = LicenseKeyHeader.decode("XA--75-99Z--");
		this.validity = new Validity(severity, pluginId, code, message, exception, licensedTo, licenseKeyHeader);
	}

	public void verify(String featureKey, String actionName, int requiredStatus, IVerifyListener callback, int style)
	{
		callback.notifyValidity(this.validity);
	}

	public void addVerifyListener(IVerifyListener listener)
	{
	}

	public void removeVerifyListener(IVerifyListener listener)
	{
	}

	public boolean handleXMindNetCommand(IXMindNetCommand command)
	{
		return true;
	}

	public void postSignIn(IAccountInfo accountInfo)
	{
	}

	public void postSignOut(IAccountInfo oldAccountInfo)
	{
	}
}
