using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class SlidedeckProfile : Profile
{
    public SlidedeckProfile()
    {
        CreateMap<Slidedeck, SlidedeckListItemDto>();
        CreateMap<Slidedeck, SlidedeckDetailDto>();
        CreateMap<CreateSlidedeckDto, Slidedeck>();
        CreateMap<UpdateSlidedeckDto, Slidedeck>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
    }
}