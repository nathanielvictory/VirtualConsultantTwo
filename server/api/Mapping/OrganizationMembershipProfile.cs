// api/Mapping/OrganizationMembershipProfile.cs
using AutoMapper;
using api.Dtos;
using api.Models;

namespace api.Mapping;

public class OrganizationMembershipProfile : Profile
{
    public OrganizationMembershipProfile()
    {
        CreateMap<OrganizationMembership, OrganizationMembershipListItemDto>()
            .ForCtorParam("UserName",         opt => opt.MapFrom(s => s.User.UserName))
            .ForCtorParam("OrganizationName", opt => opt.MapFrom(s => s.Organization.Name));
        
        CreateMap<CreateOrganizationMembershipDto, OrganizationMembership>();
    }
}