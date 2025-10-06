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
            .ForMember(d => d.UserName,         opt => opt.MapFrom(s => s.User.UserName))
            .ForMember(d => d.OrganizationName, opt => opt.MapFrom(s => s.Organization.Name));
        CreateMap<CreateOrganizationMembershipDto, OrganizationMembership>();
    }
}