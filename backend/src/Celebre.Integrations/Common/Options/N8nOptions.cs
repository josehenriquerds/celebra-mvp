namespace Celebre.Integrations.Common.Options;

public class N8nOptions
{
    public const string SectionName = "N8n";

    public string BaseUrl { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string SendMessageWebhook { get; set; } = string.Empty;
    public string VendorSubmittedWebhook { get; set; } = string.Empty;
    public string GiftReceivedWebhook { get; set; } = string.Empty;
}
