// A model is a set of classes that represent the data that the app manages, in this case the model for this app is this GlossaryItem class

namespace GlossaryWebApi.Models;

public class GlossaryItem
{
    public long Id { get; set; }
    public string Term { get; set; } = "";
    public string Definition { get; set; } = "";
    public string? Secret { get; set; }
}
