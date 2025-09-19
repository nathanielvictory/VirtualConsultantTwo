using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

// Remove EnumHelpers + ParsePromptType entirely.

public class SystemPromptProfile : Profile
{
    public SystemPromptProfile()
    {
        CreateMap<SystemPrompt, SystemPromptListItemDto>();   // direct
        CreateMap<SystemPrompt, SystemPromptDetailDto>();     // direct
        CreateMap<CreateSystemPromptDto, SystemPrompt>();     // direct
    }
}