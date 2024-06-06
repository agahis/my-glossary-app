namespace GlossaryWebApi.Models;

public class GlossaryItemDTO
{
    public long Id { get; set; }
    public string Term { get; set; } = "";
    public string Definition { get; set; } = "";
}
