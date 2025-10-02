namespace Celebre.Integrations.Common.Options;

public class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public string PhoneNumberId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string VerifyToken { get; set; } = string.Empty;
    public string BusinessAccountId { get; set; } = string.Empty;
}
