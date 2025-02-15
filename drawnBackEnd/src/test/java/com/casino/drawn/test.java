package com.casino.drawn;

import java.util.Base64;

public class test {
    public static void main(String[] args) {
        byte[] privateKeyBytes = new byte[] {
                (byte)134, (byte)2, (byte)241, (byte)204, (byte)117, (byte)55, (byte)253, (byte)164, (byte)175, (byte)129, (byte)43, (byte)2, (byte)243, (byte)71, (byte)167, (byte)177,
                (byte)154, (byte)160, (byte)145, (byte)187, (byte)106, (byte)54, (byte)34, (byte)226, (byte)249, (byte)115, (byte)5, (byte)132, (byte)211, (byte)105, (byte)55, (byte)134,
                (byte)100, (byte)56, (byte)5, (byte)86, (byte)127, (byte)152, (byte)216, (byte)46, (byte)115, (byte)166, (byte)226, (byte)93, (byte)131, (byte)168, (byte)10, (byte)144,
                (byte)219, (byte)28, (byte)123, (byte)114, (byte)87, (byte)148, (byte)167, (byte)49, (byte)12, (byte)29, (byte)60, (byte)230, (byte)44, (byte)2, (byte)100, (byte)94
        };

        String base64String = Base64.getEncoder().encodeToString(privateKeyBytes);
        System.out.println("Base64 String: " + base64String);
    }
}