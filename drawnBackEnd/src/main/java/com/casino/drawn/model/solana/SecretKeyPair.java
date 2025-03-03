package com.casino.drawn.model.solana;


import com.casino.drawn.model.User;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table()
public class SecretKeyPair {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    @Column(columnDefinition = "BLOB")
    private byte[] privateKey;
    private String publicKey;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}
