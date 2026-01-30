package com.codearena.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDTO {
    private String id;
    private String email;
    private String username;
    private Integer elo;
    private String tier;
    private Integer totalMatches;
    private Integer wins;
    private String avatar;
}
