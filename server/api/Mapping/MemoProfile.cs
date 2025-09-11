using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class MemoProfile : Profile
{
    public MemoProfile()
    {
        CreateMap<Memo, MemoListItemDto>();
        CreateMap<Memo, MemoDetailDto>();
        CreateMap<CreateMemoDto, Memo>();
        CreateMap<UpdateMemoDto, Memo>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
    }
}