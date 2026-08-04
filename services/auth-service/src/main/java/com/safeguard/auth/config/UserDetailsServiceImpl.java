package com.safeguard.auth.config;

import com.safeguard.auth.entity.Citizen;
import com.safeguard.auth.entity.Officer;
import com.safeguard.auth.repository.CitizenRepository;
import com.safeguard.auth.repository.OfficerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CitizenRepository citizenRepository;
    private final OfficerRepository officerRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return citizenRepository.findByPhone(username)
                .map(citizen -> new User(
                        citizen.getPhone(),
                        citizen.getPasswordHash(),
                        Collections.singletonList(new SimpleGrantedAuthority("ROLE_CITIZEN"))))
                .orElseGet(() -> officerRepository.findByDepartmentId(username)
                        .map(officer -> new User(
                                officer.getDepartmentId(),
                                officer.getPasswordHash(),
                                Collections.singletonList(new SimpleGrantedAuthority("ROLE_OFFICER"))))
                        .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username)));
    }
}
