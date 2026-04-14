using Ganss.Xss;

namespace FantasyDomainManager.Services;

public class InputSanitizationService
{
    private readonly HtmlSanitizer _htmlSanitizer;
    private readonly HtmlSanitizer _htmlStripper;

    public InputSanitizationService()
    {
        _htmlSanitizer = new HtmlSanitizer();
        // Configure sanitizer to allow safe HTML tags for Notes fields
        // By default, it strips dangerous tags like <script>, <iframe>, etc.
        // We'll keep the default configuration which is safe

        // Create a separate sanitizer that removes ALL HTML tags
        _htmlStripper = new HtmlSanitizer();
        _htmlStripper.AllowedTags.Clear(); // Remove all allowed tags
    }

    /// <summary>
    /// Strips all HTML tags from input. Use for Name fields and other fields that should not contain HTML.
    /// </summary>
    public string StripHtml(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input ?? string.Empty;

        // Use the stripper to remove all HTML tags, then decode any HTML entities
        var stripped = _htmlStripper.Sanitize(input);
        // Decode HTML entities that might remain (e.g., &amp; -> &)
        return System.Net.WebUtility.HtmlDecode(stripped);
    }

    /// <summary>
    /// Sanitizes HTML input, removing dangerous tags but allowing safe HTML. Use for Notes fields.
    /// </summary>
    public string? SanitizeHtml(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        return _htmlSanitizer.Sanitize(input);
    }
}

