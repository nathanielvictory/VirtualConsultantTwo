using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public static class EnumHelpers
{
    public static SystemPromptType ParsePromptType(string? value)
    {
        if (Enum.TryParse<SystemPromptType>(value, ignoreCase: true, out var result))
        {
            return result;
        }
        return SystemPromptType.Unknown;
    }
}

public class SystemPromptProfile : Profile
{
    public SystemPromptProfile()
    {
        CreateMap<SystemPrompt, SystemPromptListItemDto>()
            .ForMember(d => d.PromptType, o => o.MapFrom(s => s.PromptType.ToString()));

        CreateMap<SystemPrompt, SystemPromptDetailDto>()
            .ForMember(d => d.PromptType, o => o.MapFrom(s => s.PromptType.ToString()));

        CreateMap<CreateSystemPromptDto, SystemPrompt>()
            .ForMember(d => d.PromptType,
                opt => opt.MapFrom(s => EnumHelpers.ParsePromptType(s.PromptType)));
    }
}