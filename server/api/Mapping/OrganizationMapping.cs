using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class OrganizationProfile : Profile
{
    public OrganizationProfile()
    {
        CreateMap<Organization, OrganizationListItemDto>();
        CreateMap<Organization, OrganizationDetailDto>();
        CreateMap<CreateOrganizationDto, Organization>();
        CreateMap<UpdateOrganizationDto, Organization>()
            .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember is not null));
    }
}