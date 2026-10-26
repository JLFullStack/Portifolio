namespace ProjetoBase.Blazor.State
{
    public class ErrorState
    {
        public string? RequestId { get; set; }
        public string? Message { get; set; }
        public string? InnerException { get; set; }
        public string? StackTrace { get; set; }
        public DateTime? Timestamp { get; set; }

        public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
    }
}
