// Mapping/InsightProfile.cs
using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class InsightProfile : Profile
{
    public InsightProfile()
    {
        CreateMap<Insight, InsightListItemDto>();
        CreateMap<Insight, InsightDetailDto>();

        CreateMap<CreateInsightDto, Insight>();
        
        var upd = CreateMap<UpdateInsightDto, Insight>();
        upd.ForAllMembers(opt =>
            opt.Condition((src, dest, srcMember) => srcMember is not null));
        upd.ForMember(dest => dest.OrderIndex,
            opt => opt.MapFrom((src, dest) => src.OrderIndex ?? dest.OrderIndex));
    }
}