package com.casino.drawn.Model.Solana;


import com.casino.drawn.Model.User;
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
