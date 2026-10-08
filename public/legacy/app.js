
/* ============ DATOS BASE ============ */
const LOGO_B64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMwAAAEACAMAAADIoWm7AAACf1BMVEXj3GWQLByen5/s8DPl20bn1JVhKheabR308UVeX2CriBysp0exsQC/v8D/fwDenyT30iD////e398AAP8+QD8/QEF+gH9///+/wL+/wMHgECP/AP/fZRLw8Tv27UEA/wAA//9/fwB//wC/f7+q/1X/Var/f/8BAgP86wIAAAH+9w7cCBvhCB38/PwxBQjWDCLmhBPx6kLPECMWFRBwaRqUjCFAOw6BdxosJg3iCSGyqSXz6zvz6CackhpjXhb89iVORxPQxicnKCjn5+c5NRC7siQkHQr//wB2cRpHSEjY2dnGx8fEuCaIiYm2t7fk2Senp6f9/lSPhhuypxxnaGhaVRZVVlc2ODjc1CV2d3fEuR3t2RmXmJiDeiGQDBnSxxunmyduCxRQCA5yayJ5cyGakyT37C7z6k+mmRzRFRS7tBz8/n3b1BzRJw/17Di0EiLZVA/2yRisBRfTNg3YRxD37Db160bjeRTupxb38TCRFBqyDCL07Dju6FC/vz/xtxf06EX28TAdIBgeICJ1FRpiWiTjahPpmRfv6GX38jQcHiGNSBpcWSSsEh2qqlXaZhL/AAD06GXiVxP/qlX7/z329Ep/f4CZEyGOWRv/vz/o1W7z8jX18UM+PkBORyJeYF4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC6e+S4AAAAoHRSTlML//8i9gr//2P///8D/wL/9AL/Af///wL///8B/1SxAQECAgQDAwL//gD+////////V////////////138///9/////////wH///////////8E///////////////////////////NMf///wT//4////////+1bv//0f//cBgE/4m0////////E4v/////A/8BLP8DBiz///8EDnaR////D0bjwwAAHGNJREFUeNrtnYd/2za+wN297q433929W2+ThEQrEWWbUhhT07K2ImtGii3bsR0nzXL2apo9unvttdfe+FffDwC3SIpSJEvO59DGkkiKwhe/AeAHEJh5evgPh1+KdOTw05mrMiJJgsQiFt6xakJK6jlgcwQ5HfByBCG3n0KG8y6Jla/OHNZvcMATOjJz5GWCIZJBLxWMR72c1iQbYFAkOX+gU3IF6TBzzAFPFQNM5aDDHH2ZJPMvmOGTMPUw8Ww2kUhkmRZ5LcPrOwzTyJaVE4kGkyMXVJlMtsDgyzIMUywyZXK6wLya/TvD/CrbUW9UnyRMg+dzudxvmQKfhdcOvFbxwRwTJydycYHni+Uiz2fifJFhyjzfYgQ4nSPXt5giD3AZOBVXr5ukZPgseSUQ6iuFoSeERIIcLjD4QC7BgxDgX5FvkNMGGHx9B1inEiZBjEQgry3IJKbiy9kcnFYkYobB1xWmFUaRjAJTAM0S4ny1mGDqAKBLpqHBMBR6ojDxePwBQHQy9XrcJJl6vZ5RYMoA0+HjDb7R4ZkqHweIFpwW8Gsm01IlI5QnCgMOAFIRcopTy+QAICXAZnjwUoAMpZ6p8gKQFHgMgdMvlVfqAJTrJimZRKHQqWLJ1O0lk+DL5QS2jDr/zwIPKpUpJ7B6/UWRTLHTKVIYfF2DmXKb0Y4Wylk43irmGAeb6fD16YBpuXizOl/G78rZIvwtQhXp4M3IddMkmRbOnMWbUbJsAtwA/tti7OoZ7bopgMl1yuW/gKfiy50s/yq1gXI5zpD85XCewdjrpBFQx++Lr5bLVWs9kxvaaEYDk1NgcMopb0BZ4glyJAN1JWTyL1gaHR6aavA2EWcUL9ZRYaAtl8gyk640mfhzqk3x+4LwAOsIvCHuNR5//vz5A/xKTgv4zwPyFh94HhcE4T7ULPRaOKucnKSaHYT+zOwBSF5hZoMBSMFAUEkBNQW9HaH/eq4xHAgMd2N6AH979/ysZxj/lCefL+gZJuCb9uTf9Q4zcIL7q68+r1/wBYZNADOAZPxTL5p/wbxEMPiVeo9BjHPQLwxy5+FgAi+TZALw3+8PTV26PKSahX2Hpm9Y6ZDPPzTM1A31TQTGMhJ+oGFQKb+yki+hUTPtOwwClLfeXN3bW7358buxucWF2Ohw9l8yqPnKHqltAr51csNoalQ4+w8jf+wLk/rNH9hQBpmikdFo23hgbKa7aKeOr4Zpr8N/a5aJKPdOzjX78bjcc7Qwxh/Av1Y6XVlejNZClbxk/Wl06pbaibrFCK8/YpLKQGD06JrknFckHa+EatHaciVfMs1HgjPtUcKglWhTL7ZmJDSvh1GSXQsOendPhQkw95vClvyedrFYO7FyPGYzvQXJ3aQ+/jkfWolJ2g82QUlHCZNihFBkrd1eO10JJa2hkWgJmSWz5/cp3dsNJjUnR5Ys1/cIE/xf1HrXZOjoylqptLYSEpjUSGFKNHLsENYSm8bcobWbYbWvvsokpZjl6k0blqboOlJdGiUMK0ddw1aiSTbo44AWeZhlRFM+hUWbWge1XVmYmjxSB4Dy7kG4qGzMW3dVM5pVy4Vd2c6XuxcVk0cj9mZ9gp5zxuKWXoFvB/b2cO/OEq3btHFlfe8tj7qekbeWPKk1dnfo/dXw6neRyHerAZ9FNKJdO879zlto9JUmKrkW4LJybeitPELyd+tdPJG1+zBsFU2s12JCrmIxuYuRtQBQze1Hl5TKIzK/8d2a3FxBtH5aDaybr9vq1TNXwXwijaM5gzZdFTukqhn71sPVj7ukEgeFWwjctJeg4caLrjfeHINk+vgzvSpgUeTNdWj9v9XNx9ps6ZVbLn7Pi82YFHNUMO7lt2K4tBRJzq6vrm9svCmKbz60GI1gU2VG3GuZkcMgcz3ene+dI2msBBdAOKu39vb2Aj5o0vTxAD2+eb5r+mhoX4yjnpmTm0nHWob45/a7H99c3SPBcQvMqb41TbJpnjQ6N3IYYyUtStAsX9YLMm9T2Ej+4Pi7b338yisPLb55wa4HIOd1US+DIkrG9k101DAl0eqRUGw5KQiCWItIyLmvxUpRFxMw9lkiNVFghORJooZo2ej1S6OFMZsM7V5AVkvNEtuvO2xtQyYdu5lSu12S6O3QKXszGw3MivGC44ZnRfp12mM9TryNXPrNegfK1lWOBsZ0xWnvsQm05VpvOH4tZc3qKGEqvWrmDSbqWiU5fi1i7/hHA7NgvOCEZxi7dkPFC8yyvQMcA8y8d5iac/vaNUX3DcaT2veqvqtvdnMb44XZ9Agjz9vAeJCrpYszXhiPorHvD4vSgIIZN0xU9hRAF/r0FpwEGt1XmJ6mpS3MJ/07KJ4EOm4YD3WNYzcljwb83thhhHxfGqfInns52FRNY4dhhD6ycX6QbQu5enNhAjA0OumcL8kx5OrWBJC7Nl/YDxgmJKFBWpjWQI5dr8Y2hrYvMEzSebASzTvCLCKnHkAqyUwOBtomDkPJvf2Yvn1NOeYUZdwvGFAaWxy3YLhdjYtQzDlKu38wUNIRqYfHLcyWlHtIpBW32O9+wkBza3nN0oV2MRkmKVn6ymvL7oNN44G575LD5ZUmaxhLFvvC0NUumivLSedL/yGMDyay7BpvTtYqkVibZFN2g5EJcim2MreYdJ39H3p9aYww8kLfafmCmIzWQpsumRQ2Q7VoUuz/EENFlsYpGRZ1x/uQspG5i9j2OGEQK3+yXzBkjHm8MO6DdqNMpNWzNF6YxcGy1MhpacCHMBf3C0b0nKUMr6XGlMJEIqJ3mGyn3MHJq2TmT+wzDGK3RK8wgz19KR6VY/sLswJvpOg4YGrQzju+7zCWePCoYE7CT6xNAEZx0mJ/mAykfhYjPhKUYOlEYKhkxNcjIdEVplgmz9O7OrPQCistKWH1ScKAkktdD6454SKbJdwjWlLVbHI2I+qd5M1QNGkH04rHGzleeZjbqFnRUCWyqY3BThdME8lk/qN4ArCUm8ULBfKUf0GHSYZCJz+hsSroC8wpklG6QBOGkTSYGHRSBNJERD0xVgPMFiCk1PkN9M5kTtSkYLr2MIglgf+aliFbGHyXFSeYzf2HOeUAgzSYNbVXUq1mLDD5AwujVpoGmLUDB1MSzDAdDUZoswcJJopbbsqMOLw0TbXRqCY0GFGb8UHcyIkphcnrMPogQEetNMuGAVo6N2ZKYI72hdGjgB0zCwk1U5iICQYlpxdG7yDESTL17acKptIfZtFtrMlOzSgMoCoDgQRGnA6Yk04w3WmHyffCOI5p4JFddPRgwTj2CppTCRPSYY73wpx2irq2taFoC8y8CqM7AGlKYJzGAZPsAYQpOUTYycTeAwbjOA8g5AgTnSTMsjYOpsGwOgybdJnS4A4zOW/mBOP0uE33gMCkjGrmNPaR12EifdVsojDsBzqMfa1Jp85NFcyCAUY2SuYDtZFvmaSuh5cMU55S0wFzwgCDHGBizp55umCMkmHtYRx8M53SRO83WZiUE8xpGxj7SRpHnWFqE4I5aVEzWxhbd5YywJx2gMlPA0zEDDNn68zYgwkTc7R/e5jFKYCRnWDspgIrD9vT7+anD6ZXMknqmm2bzfOS/kzZ8QMBIzmy4EUn8CTZkA1MaEIwm+4wsttCEpgGTRNMSIeZ12FWFJhFhEqi6wwfW5hNFeb0FMHUJCQlXUdjZdqccYJJTQcMbjVvyn3nO8DXN3u9mQYTmSzMigaDV7zoP3djGeFvTyEMa4SJ4fl1HmZxzSF5eVrVTIOBTMmeptdtIfmkBWZ58pKJmmFY+aS3STJdpWEzzTA0c16S8rj3FMMMssI46Q0YYBamCUZsuj01Y9MdSGl3mSjMog0MZokMNOlPiKmui8BUpgQmQhr3A7IoNJFpg1lhkiX7J5n7zJhr4nblEiNOE8wpaPU7NvpdaaCzhmJLwiRhahaYGOhYbIkZIiUlTBNtqzCbE4chq5qKzFCJdG8kLTA4BTCQnSFZ9EfQaC5OToFkJNuIn/qMzKNHjMtMW2XJv6mBIY1+QRQtmX1PVAbXVLm9Z/YRgtpZ0x9TnSiMiDslMo7fCU1Wel0w9yiX1Ein4rVfN7UQhPdiKfJw0TKmocPpE4CJqjBkQVD5kdJwNPfKREmbdqlO2IiZF6KYlxGdL3ACB9/a0cnCkKebZbVXZenJRKhXIA//KUYVs4Q5a+qX8GIJ5MnmScGE6MPwtAODV9aKiNET+mJ7j2Q6qhFTgrUCnV6ndxFSqeX5FXXFLDI6AGYTmhBMJWIY7sMt4LaESMnfp/OuaT7Vp/+JfQMYDdwIdKSdbWtzVUhnTY5U9hUmZKhc9EflTyrbP7NNyNZJNXMAoz+VjUMDMTXE9yiiDGnqyyBE1O2wJwPDavN9DE/4ikeJFRB/xwpLhoUPAS2mOo6aHNEXFVEm2qlr/05CzYxL/hgWLFlDmFcgc5fapvUy4OLj6tyNGvQXtGVYlfUa8bIcaAIwivKgvMCovsiw+HxIWS8WrZ2QzctJraiZxbOFJWRZ0GRJ8RX7G2tWlptWG/2kdYWMy4fS9lbvOgF0oTb0iGohsq5nJH5Az6eW9s9mTtIyVSP9QhNZV1qKKcbcs0yAssKgELWcUdp26lgUXlg7NGaY02TksSubG/1d68KToZN91/yxwqiVaVIpJ3mBqvKYJbOg2LQW6e9ZEgOtlPotFiT1LFqjLlMzL6krpS+MFuaaDYymKmqjX7RZf7Xf/hR2V6mrTUUl42krzLWRSkYr26hpYH8ESdXammxdIskkmWE307mglV4PjFzTBidGtumHGqhaNNAkDTC4Fhp2ZyAQ6AWzZJa0ulGbfZGU2JEl7SlWw5JBJskg9sKLbA12uW2YhJBUXTAeW9GieCNM2iJtml7RnKmSaV/2qftpDbXPmUKDYRY1S5e16z+JpVJ5JaUMKTJM6ka0+2otHRk/3k5h0E8vKbuVDQgT9lGr8fkuXVQmIVTUIIqBZXxJWzYMSTVl4d67ZzWWwGC7Nqri9PvO3iV9ly1914Qusw9Jq4mRXMF9HHRo16cpTMC3O8B+mpo44XX3fWSsFQaOjg+Z9GqVtL8/9+GdhrS96DxLhvk2rBsNvsE1YysyxexTMlRg6OJlReuVFP6W8Qoz+61BNHj7ys9ZtWe5X3Ixygah62fxHjC6XwreYjzDMMzNsE+3G+C6fFEtpkpo31JF1bLf7xp2KoS3wZvMIDDMalB3g8QNXEfWjZXGnzQVCwd0G/b7gw+ZwWCYh0HjPpLw/po0ic31EAteDBtJWLf9dWZQGEKjKlogAO8u/BT1bRAb+s60I6lHcVjPXzbe5+IFUpKGDT6DG4wjzBHktOTletCgaFhXQdU8ZkcKiaIYLeEeI7xJ4mjZMj4SQ8eTSRG/81gkT84afRjkJnx+g+kDY++iNkw0AbjrY2+FizYZISniRmiSvIEWXIi8EUvHoQPkFYaIxbzTafDbWdusnjLA2C/fy2yc1w0PSgj8yCVvwhGYmIyjZDHcqYfmY0UWmIgMXdNUjPmH7FVTr+36wqYNYG3NRZ8bcmTmKolkOcx1m8UuOqAWC3l53PZAE002cVcEYJJk1t+cvCiuIRRl8nkmKnvZWQ+x718yWj1RMVtz0Z5jwZJhWbfNedYDPstewVQ4/bMjUxhycxpXwzAgmdipbr/eKUIXP9/VrYWUoz98ftZxPgEO6qA/zLzWp17fCJpZoEF94SLqmxkWK5URBkkSVTPRGjW0+XYbNCxgMnwXFdOGRQ/PcPdIOTsPr2LDMeP4zh5y1zXUBCcmQHmt4bm1BAa7tSWGiYEDmEtBTeC2bUP70FmjYmNF9zt4MW0qHraVL2e4Z4h13wRq9qZFOODXLj1xrULnse9KplBehQEngI9EUDsCtiMJzkuDExSi2YYf9Qduzrq14kg8/qffz3A7iO23idF60G8sKHxz34XrjnaD1/bBVQvCMBKFEZk8XRBZBrq24LChBkjlySVNsxQvCooR2HAffCffvcfNcDPbiO23CdzGrbDPLB0wzst3WafNJJeYphKmVCUjKhHbtegCyzrAKAoWtlYugVdm3ZvXZH8edJubOcb9DXnocj0EyQdMFgnpwl3bDVuwZOheuqcZUUYyhaF7WEbwkqCSYGMziL147azWWzcU2/mNfvNvSIRI+gbD7NAWSNL9GxufBv1m6eAPl5+0bfYtLC0xm8uQSh8IzCeVEF5MVGRCJ5eXQ+0YI4QqtZ6N6OAm1y/smjcl99N6cnW2/0xcfIftn6VnuPQX215Ew8yuBsI+U5OPWNGlQ72OWp3CkEcRgf6aWlQpmYwaiqbV9EFgFw9d3g2YqvsAtc1PN/r24ahgQMu+nuGOcW8jh81Vepx00Nezv3zAt/vV9balUl+jCQtpbS0Wk/GRGP4fWw2kknE/WDB6LJSwpT7ze9EwLfSBZBAL/J9+bZu02D1MF1sPmn+SfAJ5nf3czKN3rkyv1h1z8Zv2k6/OkprEb934Phxcn/XAoowV/wBSmeHgz2HUb/Frg675reVHogS+S58/ucgOsp8xvvYuaBfpeQV8PcmDsagzI7Fm30mnMQyX/tE28uIDVF0jjkCpdZRwIfl09sKhu23WuP2v48rsoFt3n3x+aVc3wkDAaPZhjyhqtBAs5hhHYP7M7cgsy3qdl7i+h7Ui0FuYFOja9Yttxy2d6eGL1w99RUDCPSZIKn9A2fCGoox0oe2nIBgCAzTn6LGj3u6wHrDxBCQYRAh3L114fOj63Yttk6ng4dmLd68fekw5sHKFw73a5fPv7nqVirbXKDoCDApM+r/OSIhlWc9L/s6uB4O9ZRqgRMrH3bNnL12+8Pjx42s4Pf7qwuVLZ3d3dVML2IgFm0rwpmcURlij2T7HpTkVhvuMO0L7f95WLSU457Fn8/utKuL3hxUou2L32WinwZWEg596lwqjTlhB26+lf6LDgPV8hEyjrl5wbgXCYXPr1jaTlkaqI4rfv/vp+iAo6v5naAdbvw6TPnOMVDb9toO2eLZVkE6fbHpJBGUAq1eSssGIfFthUWFA53aUaZ9rg0xPhnon8OI0ABK8NZhQDONp57hjaTMMeIMjynL9A062xuLRNcUjmV//gj/878HzA5PQmZA4u1dm0gqLDsN9yF2Vh6IB61kNhv2D6VWASjQMJJ8OQQKVpZLZG3c4lcUAw/2VOIFB7Ubh2VjF3s2bYDSxhAPnb24MQ6JtMIhuHOPOcDYwX4BLky0zFgYVUDAQ9vk9CCYMZnJrdX04EL0LgW58oxq/BQbaz9w5lWZzuF/ZWF/dCwCRugl9j5sGjnAgcH5vfWNYENxQbirPH2zvGFlMMFz6f2i7BrHeR5R7m3OzIKLVT88HQEwBv4oVDgfDcCR4a2/1hTjo3G+k2cuHnBMMtJ9B05QrI55anY1sy0HpZjc2NtbXgYskeLe+sTHriBFv/abhsfTU7YXR9jGTXKwwWNPeVsf7P/BiOHWypGQ8zrxgKvJ8zpuKqT1u9McZg+3bwWCaI4psWLnS/94tHksml6gW6sMBxd8p4C+WE2X+HS+1vhp8hLrSytIDg5tpO9vqF2Lz/W5e4P9JxFPneT5bFoRBiO4zTDWL1wuv4/tkEgnBu1jkw9xP0lxfGLCpO/e0aUSVPj9Q5jMgGL7BCFm+mBU6PFk2O97o4zMarU4xwQtxni9kOvxvgYpvVPlOH4e8peoMuvIa92EPix0Mtqqr2tdK7o+Q5/g4Q3IR5xPkY4Yi1unpaqsKWRcydZzgTaGcyyYSBbzgMV+sgpKCxQl8VmAyfJXJuu+2sVzSxPLR/1pM3xkGG46maiw67aZrWV6Af3GsakXIV4KPU3POUBlAnjMYVFl9Fj5nf1xOgJ0JBWxsGWL1DSwqKJCMmw+oxbR5FTe+5NJpzisMVrWnf9OEIzlvmwGlCoIpEONpqeKheqf4OuVwpvGrHCl8gH0Hy6NOhcIL6o3KTDzbu0C9aiwRPTz17Hvuwy+4AWCg78kd3taGvKU5h7ZnHORBDfc3WAQZLB5IP6cCAkKS5weE8d+Ai1CSqxpEDIpaQkokitgX2JpoMqLPr7zxGmerYm4wXPoY9/SZNgiDSidscX7JF6rEOYOCCQyj2LCgZiqXEHCe6WcMU6Ral1WPFYhUqTATZfAFHTsUPRvS1Te03ssAMIR/54o6MwGh0pxoV2cWfk4yTvW9Q/WE5JZAFZksnBaIZFqQ8VexZ6iS08TciaWBg3gAmHFSJBnLL8wbUc495bgfOefYBQYLB+uapqzSVrK3zszR/LdImSqGr1pyncgijk2jWq1iiyjw2WyCJ76uiP/GiXxwGXSImbVydbPZp3QFQ/d2OBex9IGBKjbNzVw1PEzBRqLWOlPJN3XGWWordWXZ7AJ8bAEfFDhOBcycKBbpVwq07YAZqnB9q9f4BcMeightH+YcnJhHGKJrd84ZcCz7+AmZDpZFtZ7lHzDMc8VW1Oovx3da2J1h7YmT6rWOz9D6hF70Kt8RGjm4pp61KFiyUjKiHPkPLn2mT2b7wRBdu/MRa7gvG6lZfI6AGyXlDPN3/seMXuiG6gV7hzr/quLIqNVTd1YnlxR7hLK4YphIibbB7h192AAwCs4zwy6TCDWPRk08wt9bZajXW5CtQjWu+gHwDvFGBls7dtXEPAhBg3gzwPgxaGOjWK5aK/75rZJsRHl7xguKJxiK8/TqDdMATOxoradOyJRzeBcAUK9ssYzbLBlSgShtBGwe1M/lwMCgVklk7RpjyeWYZNAD6crhX/ex+8FgKM4bb99jjeJB7W4vj9CoC0whh/UOlO++YuKklVMAI6FVfjXXYjL1eG8FKUTnYqYHnthzO5xXFM8wFIfb+ZtkHh9rr9Tsm9VCPC7UiZv9Z7nBdMrP8U40oHz1jHNjOnq0aR5+2756B//wn7zm0TMMvisU0LHDV0x7tALPVpQZQYpuWUjYe0cgc38+4z2Dg8Bo4rm9zaoDlYr9VJIvRpKsxGRTEbHbPxD9+s+BsjcYjCIehcdYjMdDQ++zKYbyrEnW6MaznV+oPzVOGNwsIF7yy9tXzDylufmh1OtUyXQbafvczpkBjP4FYTjuizN/xT915/YVU+0jpRYHFI8QOs6aBLx9+5vfYZLPvhgmX0PBEH0jffAvb2+beGILA4Spxbm2qSy2f/iGtKCGEcqLwRjs5wYyVnJzHp1BNGKsG6Ga3yHR+/QXw2foRWBU+fxi55xRPFLEA07UsOU7kqVzr/1aFTY3MRjCA3/eMFY/SOomPaOQBssbWCZnXjgrLw6j+rcvPzLhuNjOfES/UN6mDZYz6RHkYyQwauvg6rYBxykGInYNnccrh78fpkIZL4winp8ZtA2V7GZICAs6inTlmyErlLHD9LZFUX7eMVgMCob1Kz1ClNHCKHnb0SJUyDpkNacO/gAKbhB/NtJfHzEMjYFwO+c04cQMfi2px/B/ONM3OjENMNR4dp6pMpC0NUJDisCQ/OzYSE1lnDDUeGj8EI+OdlUVUz3YznhQxgRDVejIDWVuC1kCRZ2EsH1kXChjg+G4z9Lc10rADU/5UGYfSldnxmArY4ehseobykIy9ClvdO9LbzGj6YPBpvOzq2r/GlvPR//NfZ3mDiYMGeVRhINV7HD/AOs0w3Dpr7mndLQX3ZjhZtLcQYbBJvI7PIUF3fue+3rcvzV2GC79Ezx2/ccz47T8fYPBfuCj1+9wZ7iXAQYqlv97Yz9YuP8HYQdJakmwh/4AAAAASUVORK5CYII=";
const FUNDACION_BRIGADA = "2023-06-21";   // fundada como Brigada
const FUNDACION_COMPANIA = "2025-11-05";  // elevada a Compañía
const FOUNDING_DATE = FUNDACION_BRIGADA;  // antiguedad de los fundadores
const SEED = [
  // Orden del Día 010/2026 - Listado de Compañía y Claves (25 de enero de 2026)
  // {clave, cargo, nombre, apPat, apMat, rut, telefono, operativo, formaIngreso, origen}
  {clave:"75", cargo:"Director", nombre:"Karam", ap:"Puali", am:"López", rut:"15.243.920-2", tel:"+56 9 9638 8991", op:true},
  {clave:"45", cargo:"Capitán", nombre:"Fernando", ap:"Jerez", am:"Pantoja", rut:"15.590.310-4", tel:"+56 9 4213 8558", op:true, forma:"Traslado", origen:"Por confirmar"},
  {clave:"9",  cargo:"Tesorero General", nombre:"Fernando", ap:"Ortega", am:"Gutiérrez", rut:"10.234.287-9", tel:"+56 9 9706 6611", op:true},
  {clave:"501",cargo:"Teniente 1", nombre:"Tomás", ap:"Lara", am:"Jeffs", rut:"14.118.272-2", tel:"+56 9 9840 6864", op:true, forma:"Traslado", origen:"Por confirmar"},
  {clave:"502",cargo:"Teniente 2", nombre:"Matías", ap:"Corvalán", am:"Garrido", rut:"20.256.703-7", tel:"+56 9 8890 9899", op:true, forma:"Traslado", origen:"Compañía Alemana (por confirmar)"},
  {clave:"503",cargo:"Teniente 3", nombre:"Andrés", ap:"Herrera", am:"Santander", rut:"16.711.219-6", tel:"+56 9 9771 2130", op:true},
  {clave:"504",cargo:"Ayudante", nombre:"Francisco", ap:"Vega", am:"Lara", rut:"15.911.631-K", tel:"+56 9 9860 9638", op:true, forma:"Traslado", origen:"Compañía Alemana (por confirmar)"},
  {clave:"505",cargo:"Jefe de Máquinas", nombre:"Diego", ap:"Lozano", am:"González", rut:"13.829.491-9", tel:"+56 9 5611 0725", op:true, conductor:true},
  {clave:"506",cargo:"Secretario", nombre:"Susumu", ap:"Sugiura", am:"Aguilar", rut:"14.413.688-8", tel:"+56 9 9237 9959"},
  {clave:"507",cargo:"Tesorero", nombre:"Mathias", ap:"Von Leyser", am:"Jux", rut:"8.905.167-3", tel:"+56 9 9230 4753"},
  {clave:"508",cargo:"Voluntario", nombre:"Pablo", ap:"Arellano", am:"Graell", rut:"16.369.672-K", tel:"+56 9 9229 1516"},
  {clave:"509",cargo:"Voluntario", nombre:"María Paz", ap:"Solo de Zaldívar", am:"Lavanchy", rut:"18.024.584-7", tel:"+56 9 8923 0949"},
  {clave:"510",cargo:"Voluntario", nombre:"Ludwig", ap:"Von Plessing", am:"Cea", rut:"17.045.065-5", tel:"+56 9 8899 4179"},
  {clave:"513",cargo:"Voluntario", nombre:"José", ap:"Álvarez", am:"Álvarez", rut:"25.659.614-8", tel:"+56 9 9570 0000"},
  {clave:"514",cargo:"Voluntario", nombre:"Juan Pablo", ap:"Orlandini", am:"Retamal", rut:"8.338.250-3", tel:"+56 9 9419 2551"},
  {clave:"515",cargo:"Voluntario", nombre:"Luis", ap:"Bustos", am:"Rivera", rut:"12.929.761-1", tel:"+56 9 9937 7438"},
  {clave:"516",cargo:"Voluntario", nombre:"Cristóbal", ap:"Rascheya", am:"Travini", rut:"21.907.445-K", tel:"+56 9 8723 7392"},
  {clave:"517",cargo:"Voluntario", nombre:"Christian", ap:"Vergara", am:"Sandoval", rut:"10.566.726-4", tel:"+56 9 9693 1320"},
  {clave:"518",cargo:"Voluntario", nombre:"César", ap:"Ilarre", am:"Castro", rut:"16.682.842-2", tel:"+56 9 9982 5055"},
  {clave:"519",cargo:"Voluntario", nombre:"León", ap:"Campino", am:"Del Villar", rut:"22.167.254-2", tel:"+56 9 6394 8973"},
  {clave:"520",cargo:"Voluntario", nombre:"Natalia", ap:"Yáñez", am:"Navarrete", rut:"19.608.304-9", tel:"+56 9 4117 1255"},
  {clave:"521",cargo:"Voluntario", nombre:"Rodolfo", ap:"Maldonado", am:"Avendaño", rut:"19.272.472-4", tel:"+56 9 7763 8309"},
  {clave:"522",cargo:"Voluntario", nombre:"Manuel", ap:"Moller", am:"Henríquez", rut:"10.188.589-5", tel:"+56 9 9646 8660"},
  {clave:"523",cargo:"Voluntario", nombre:"Joaquín", ap:"Bustos", am:"Guzmán", rut:"20.644.799-0", tel:"+56 9 4562 1346"},
  {clave:"524",cargo:"Voluntario", nombre:"María Paz", ap:"Ortega", am:"González", rut:"21.020.125-4", tel:"+56 9 5906 2829"},
  {clave:"525",cargo:"Voluntario", nombre:"Gustavo", ap:"Jerez", am:"Pantoja", rut:"13.105.415-7", tel:"+56 9 7685 8145"}
];

/* Integrantes retirados. Conservan su ficha e historial, sin numero de lista. */
const SEED_BAJAS = [
  // Solo figuran aqui integrantes de la lista oficial (ODD 010/2026) que se retiraron.
  {clave:"511", nombre:"Vaslav", ap:"Rubeska", am:"Becerra", rut:"19.305.936-8", tel:"+56 9 8369 6928", motivo:"Renuncia"},
  {clave:"512", nombre:"Magdalena", ap:"Cortés", am:"García", rut:"17.983.201-1", tel:"+56 9 9340 0000", motivo:"Renuncia"}
];

/* Malla curricular ANB 2025-2028 */
const MALLA = [
  {nivel:"Nivel Inicial", cursos:[
    "Introducción a la Historia y Funcionamiento de Bomberos de Chile",
    "Introducción a Equipos de Protección Personal y Primera Respuesta"
  ]},
  {nivel:"Nivel Básico", cursos:[
    "Herramientas y Equipos Bomberiles",
    "Comportamiento Humano en Emergencias",
    "Equipos de Protección Personal para Bomberos",
    "Fuego y Tácticas",
    "Reanimación Cardiopulmonar para Bomberos",
    "Control de Incendios Forestales"
  ]},
  {nivel:"Nivel Intermedio", cursos:[
    "Escalas y Cuerdas para el Control de Incendios",
    "Búsqueda y Rescate en Incendios Estructurales",
    "Sobrevivencia en Incendios Estructurales",
    "Riesgos Eléctricos",
    "Soporte Vital Básico (SVB)",
    "Incendios Estructurales",
    "Introductorio CRIMAP",
    "Curso Básico Sistema de Comando de Incidentes (2026)"
  ]},
  {nivel:"Nivel Avanzado", cursos:[
    "Control de Incendios Estructurales",
    "Oficial de Seguridad del Incidente",
    "Mandos Superiores",
    "Primera Respuesta a Incidentes con Materiales Peligrosos (CRIMAP) (2026)"
  ]},
  {nivel:"Especialidades", cursos:[
    "Rescate en Desnivel",
    "Rescate Agreste",
    "Rescate en Espacios Confinados",
    "Abastecimiento",
    "Introducción al Sistema Nacional de Operaciones y SENAPRED",
    "Rescate Minero",
    "GERSA",
    "Búsqueda en Estructuras Colapsadas",
    "Técnico Hazmat (Contención y Análisis de Riesgos)",
    "Operador de Cuerpo Bomba"
  ]},
  {nivel:"Cursos complementarios", cursos:[
    "Primera Respuesta en Rescate Técnico para No Especialistas",
    "Promoción de la Cultura de la Equidad",
    "Lengua de Señas Chilena con Perspectiva de Emergencias"
  ]}
];
const NIVELES_OBLIGATORIOS = ["Nivel Inicial","Nivel Básico","Nivel Intermedio"];

/* Captura de errores: si algo falla, se muestra en pantalla en vez de dejar
   la aplicación sin responder. */
window.addEventListener("error",function(ev){
  try{
    let c=document.getElementById("errorGlobal");
    if(!c){
      c=document.createElement("div"); c.id="errorGlobal";
      c.style.cssText="position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#4a1f1c;"+
        "border:1px solid #b3241c;color:#f4d9d6;border-radius:8px;padding:12px 14px;font:12px/1.45 sans-serif;";
      document.body.appendChild(c);
    }
    c.innerHTML='<b>Se produjo un error</b><br>'+(ev.message||"")+
      '<br><span style="opacity:.75">'+((ev.filename||"")+" línea "+(ev.lineno||"?"))+'</span>'+
      '<br><button onclick="this.parentNode.remove()" style="margin-top:8px;background:none;border:1px solid #b3241c;'+
      'color:#f4d9d6;padding:6px 12px;border-radius:5px;">Cerrar</button>';
  }catch(e){}
});

/* Conexión de botones a prueba de elementos ausentes */
function on(id,evento,fn){
  const el=document.getElementById(id);
  if(el) el.addEventListener(evento,fn);
  return el;
}

/* Las pestañas se conectan de inmediato: aunque algo falle más abajo,
   la navegación entre secciones siempre responde. */
(function conectarPestanas(){
  function mostrar(nombre){
    document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
    document.querySelectorAll(".panel").forEach(p=>p.classList.remove("active"));
    const tb=document.querySelector('.tab[data-tab="'+nombre+'"]');
    const pn=document.getElementById("panel-"+nombre);
    if(tb) tb.classList.add("active");
    if(pn) pn.classList.add("active");
    window.scrollTo(0,0);
    try{ if(typeof switchTabExtra==="function") switchTabExtra(nombre); }catch(e){ console.error(e); }
  }
  window.__mostrarPestana=mostrar;
  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click",function(){ mostrar(t.dataset.tab); });
  });
  document.querySelectorAll(".subtab").forEach(s=>{
    s.addEventListener("click",function(){
      if(!s.dataset.sub) return; /* enlaces a otras pestañas principales: Guardia, Historial, Informe */
      document.querySelectorAll(".subtab").forEach(x=>x.classList.remove("active"));
      document.querySelectorAll(".subpanel").forEach(x=>x.classList.remove("active"));
      s.classList.add("active");
      const sp=document.getElementById("sub-"+s.dataset.sub);
      if(sp) sp.classList.add("active");
      if(s.dataset.sub==="odd"){ window.top.location.href="/odd-maestras"; return; } if(s.dataset.sub==="precedencia") renderPrecedencia();
      if(s.dataset.sub==="oficialidad" && typeof loadOficialidadYear==="function") loadOficialidadYear();
      if(s.dataset.sub==="alertas" && typeof renderAlertas==="function") renderAlertas();
      if(s.dataset.sub==="correlativos" && typeof renderCorrelativoResumen==="function"){ renderCorrelativoResumen(); renderCorrelativoHistorial(); }
      if(s.dataset.sub==="mantencionesb5" && typeof renderMntTodo==="function") renderMntTodo();
      if(s.dataset.sub==="inventariob5" && typeof renderInvTodo==="function") renderInvTodo();
      if(s.dataset.sub==="eppPersonal" && typeof renderEppTodo==="function") renderEppTodo();
      // Carga bajo demanda para Oficiales. Cada botón inicializa solamente su propio módulo.
      if(s.dataset.sub==="nomina"){
        if(typeof renderCfgRoster==="function") renderCfgRoster();
        if(typeof renderCargoOptions==="function") renderCargoOptions();
      }
      if(s.dataset.sub==="hoja"){
        if(typeof renderHvSelect==="function") renderHvSelect();
        if(typeof renderHoja==="function") renderHoja();
        const hf=document.getElementById("hvFecha"); if(hf&&!hf.value) hf.value=todayISO();
      }
      if(s.dataset.sub==="cursos"){
        if(typeof renderCursoMiembroSelect==="function") renderCursoMiembroSelect();
        if(typeof renderCursos==="function") renderCursos();
        if(typeof renderCursosCompania==="function") renderCursosCompania();
      }
      if(s.dataset.sub==="tipos" && typeof renderTiposTags==="function") renderTiposTags();
      if(s.dataset.sub==="importar" && typeof estadoImportacion==="function") estadoImportacion();
      if(s.dataset.sub==="bajas"){
        if(typeof renderBajasSelects==="function") renderBajasSelects();
        if(typeof renderBajasList==="function") renderBajasList();
        const bf=document.getElementById("bajaFecha"); if(bf&&!bf.value) bf.value=todayISO();
      }
    });
  });
})();


/* ============ ODD MAESTRAS ============ */
const ODD_KEY="odd:maestras:v1";
async function getOddMaestras(){ const v=await sGet(ODD_KEY,[]); return Array.isArray(v)?v:[]; }
function oddNumFmt(n){ return String(Number(n)||0).padStart(3,"0"); }
async function sugerirOddNumero(){
  const y=Number(document.getElementById("oddAnio")?.value)||new Date().getFullYear();
  const arr=await getOddMaestras();
  const nums=arr.filter(x=>Number(x.anio)===y&&x.estado==="emitida").map(x=>Number(x.numero)||0);
  const el=document.getElementById("oddNumero"); if(el&&!el.value) el.value=(nums.length?Math.max(...nums):0)+1;
}
async function renderOddArchivo(){
  const box=document.getElementById("oddArchivo"); if(!box) return;
  const arr=(await getOddMaestras()).slice().sort((a,b)=>(b.anio-a.anio)||(b.numero-a.numero));
  if(!arr.length){box.innerHTML='<div class="empty">Aún no hay ODD creadas desde GERMANIA.</div>';return;}
  box.innerHTML='<table><thead><tr><th>ODD</th><th>Fecha</th><th>Tipo</th><th>Asunto</th><th>Estado</th></tr></thead><tbody>'+
    arr.map(x=>'<tr><td>'+oddNumFmt(x.numero)+'/'+esc(x.anio)+'</td><td>'+esc(x.fecha||"")+'</td><td>'+esc(x.tipo||"")+'</td><td>'+esc(x.titulo||"")+'</td><td>'+esc(x.estado||"borrador")+'</td></tr>').join("")+'</tbody></table>';
}
async function initOdd(){
  const y=document.getElementById("oddAnio"),f=document.getElementById("oddFecha");
  if(y&&!y.value)y.value=new Date().getFullYear(); if(f&&!f.value)f.value=todayISO();
  await sugerirOddNumero(); await renderOddArchivo();
}
async function guardarOdd(emitir){
  const anio=Number(document.getElementById("oddAnio")?.value), numero=Number(document.getElementById("oddNumero")?.value);
  const fecha=document.getElementById("oddFecha")?.value||todayISO(), tipo=document.getElementById("oddTipo")?.value||"General / disposición";
  const titulo=document.getElementById("oddTitulo")?.value.trim()||"", cuerpo=document.getElementById("oddCuerpo")?.value.trim()||"";
  const destinatarios=document.getElementById("oddDestinatarios")?.value.trim()||"", msg=document.getElementById("oddMsg");
  if(!anio||!numero||!titulo||!cuerpo){if(msg){msg.textContent="Completa año, número, asunto y contenido.";msg.classList.add("err");}return;}
  const arr=await getOddMaestras(), dup=arr.find(x=>Number(x.anio)===anio&&Number(x.numero)===numero&&x.estado==="emitida");
  if(emitir&&dup){if(msg){msg.textContent="Ya existe la ODD "+oddNumFmt(numero)+"/"+anio+". No se puede duplicar el correlativo.";msg.classList.add("err");}return;}
  const rec={id:uid(),anio,numero,fecha,tipo,titulo,cuerpo,destinatarios,estado:emitir?"emitida":"borrador",creadoEn:new Date().toISOString(),respaldoUnico:true};
  arr.push(rec); await sSet(ODD_KEY,arr);
  if(msg){msg.classList.remove("err");msg.textContent=emitir?"ODD "+oddNumFmt(numero)+"/"+anio+" emitida y archivada.":"Borrador guardado.";}
  await renderOddArchivo(); if(emitir){const n=document.getElementById("oddNumero");if(n){n.value="";await sugerirOddNumero();}}
}
on("oddGuardarBorrador","click",()=>guardarOdd(false));
on("oddEmitir","click",()=>guardarOdd(true));
on("oddImprimir","click",()=>window.print());
on("oddCompartir","click",async()=>{
  const numero=document.getElementById("oddNumero")?.value, anio=document.getElementById("oddAnio")?.value, titulo=document.getElementById("oddTitulo")?.value||"";
  const txt="Orden del Día "+oddNumFmt(numero)+"/"+anio+" · "+titulo;
  if(navigator.share){try{await navigator.share({title:"ODD "+oddNumFmt(numero)+"/"+anio,text:txt});}catch(e){}}else{try{await navigator.clipboard.writeText(txt);const m=document.getElementById("oddMsg");if(m)m.textContent="Referencia copiada para compartir.";}catch(e){}}
});
on("oddAnio","change",async()=>{const n=document.getElementById("oddNumero");if(n)n.value="";await sugerirOddNumero();});

/* Nómina oficial base según ODD 010/2026. Sirve para completar/normalizar
   identificación de la Hoja de Vida sin reemplazar antecedentes históricos. */
const NOMINA_ODD_010_2026=[
["75","Karam","Puali","López","15.243.920-2","Director","56 9 9638 8991"],
["45","Fernando","Jerez","Pantoja","15.590310-4","Capitan","56 9 4213 8558"],
["9","Fernando","Ortega","Gutiérrez","10.234.287-9","Tesorero Gral.","56 9 9706 6611"],
["501","Tomas","Lara","Jeffs","14.118.272-2","Teniente 1ero","56 9 9840 6864"],
["502","Matías","Corvalán","Garrido","20.256.703-7","Teniente 2do","56 9 8890 9899"],
["503","Andrés","Herrera","Santander","16.711.219-6","Teniente 3ero","56 9 9771 2130"],
["504","Francisco","Vega","Lara","15.911.631-K","Ayudante","56 9 9860 9638"],
["505","Diego","Lozano","González","13.829.491-9","Jefe de Mq.","56 9 5611 0725"],
["506","Susumu","Sugiura","Aguilar","14.413.688-8","Secretario","56 9 9237 9959"],
["507","Mathias","Von Leyser","Jux","8.905.167-3","Tesorero","56 9 9230 4753"],
["508","Pablo","Arellano","Graell","16.369.672-K","Voluntario","56 9 9229 1516"],
["509","Maria Paz","Solo De Zaldivar","Lavanchy","18.024.584-7","Voluntario","56 9 8923 0949"],
["510","Ludwig","Von Plessing","Cea","17.045.065-5","Voluntario","56 9 8899 4179"],
["511","Vaslav","Rubeska","Becerra","19.305.936-8","Voluntario","56 9 8369 6928"],
["512","Magdalena","Cortés","García","17.983.201-1","Voluntario","56 9 9340 0000"],
["513","José","Alvarez","Álvarez","25.659.614-8","Voluntario","56 9 9570 0000"],
["514","Juan Pablo","Orlandini","Retamal","8.338.250-3","Voluntario","56 9 9419 2551"],
["515","Luis","Bustos","Rivera","12.929.761-1","Voluntario","56 9 9937 7438"],
["516","Cristóbal","Rascheya","Travini","21.907.445-K","Voluntario","56 9 8723 7392"],
["517","Christian","Vergara","Sandoval","10.566.726-4","Voluntario","56 9 9693 1320"],
["518","César","Ilarre","Castro","16.682.842-2","Voluntario","56 9 9982 5055"],
["519","León","Campino","Del Villar","22.167.254-2","Voluntario","56 9 6394 8973"],
["520","Natalia","Yañez","Navarrete","19.608.304-9","Voluntario","56 9 4117 1255"],
["521","Rodolfo","Maldonado","Avendaño","19.272.472-4","Voluntario","56 9 7763 8309"],
["522","Manuel","Moller","Henriquez","10.188.589-5","Voluntario","56 9 9646 8660"],
["523","Joaquin","Bustos","Guzmán","20.644.799-0","Voluntario","56 9 4562 1346"],
["524","María Paz","Ortega","González","21.020.125-4","Voluntario","56 9 5906 2829"],
["525","Gustavo","Jerez","Pantoja","13.105.415-7","Voluntario","56 9 7685 8145"]
].map(x=>({clave:x[0],nombre:x[1],ap:x[2],am:x[3],rut:x[4],cargo:x[5],telefono:x[6],fuente:"ODD 010/2026",fechaFuente:"2026-01-25"}));

const HISTORICO_2026 = {"gente":[{"nom":"José","ap":"Álvarez","am":"Álvarez"},{"nom":"Pablo","ap":"Arellano","am":"Graell"},{"nom":"Joaquín","ap":"Bustos","am":"Guzmán"},{"nom":"Luis","ap":"Bustos","am":"Rivera"},{"nom":"León","ap":"Campino","am":"Del Villar"},{"nom":"Magdalena","ap":"Cortés","am":"García"},{"nom":"Matías","ap":"Corvalán","am":"Garrido"},{"nom":"Andrés","ap":"Herrera","am":"Santander"},{"nom":"César","ap":"Ilarre","am":"Castro"},{"nom":"Fernando","ap":"Jerez","am":"Pantoja"},{"nom":"Gustavo","ap":"Jerez","am":"Pantoja"},{"nom":"Tomás","ap":"Lara","am":"Jeffs"},{"nom":"Diego","ap":"Lozano","am":"González"},{"nom":"Rodolfo","ap":"Maldonado","am":"Avendaño"},{"nom":"Manuel","ap":"Moller","am":"Henríquez"},{"nom":"Juan Pablo","ap":"Orlandini","am":"Retamal"},{"nom":"María Paz","ap":"Ortega","am":"González"},{"nom":"Fernando","ap":"Ortega","am":"Gutiérrez"},{"nom":"Karam","ap":"Puali","am":"López"},{"nom":"Cristóbal","ap":"Rascheya","am":"Travini"},{"nom":"Vaslav","ap":"Rubeska","am":"Becerra"},{"nom":"María Paz","ap":"Solo de Zaldívar","am":"Lavanchy"},{"nom":"Susumu","ap":"Sugiura","am":"Aguilar"},{"nom":"Francisco","ap":"Vega","am":"Lara"},{"nom":"Christian","ap":"Vergara","am":"Sandoval"},{"nom":"Mathías","ap":"Von Leyser","am":"Jux"},{"nom":"Ludwig","ap":"Von Plessing","am":"Cea"},{"nom":"Natalia","ap":"Yáñez","am":"Navarrete"}],"acts":[{"t":"Compañía","f":"2026-01-03","n":"Academia Piscina","m":"AFFFFFAFFAFFFFFFFFFAFFAAFFAF"},{"t":"Emergencia","f":"2026-01-07","n":"Fuego En Vivienda","m":"FFFFAFFFFAFFFFFFFFAFFFFFFFFF"},{"t":"Comandancia","f":"2026-01-07","n":"Traspaso De Mando","m":"FAFFFFAAFAFFFFAFFAAFFFFAFFFA"},{"t":"Emergencia","f":"2026-01-11","n":"Inflamacion De Estufa","m":"FAFFFFFAFAFFFAAFFFAAFAFAFFAA"},{"t":"Emergencia","f":"2026-01-14","n":"Quema De Pastizales","m":"FAFFFFFFFAFFAAAFFFAAFFAAFAFA"},{"t":"Emergencia","f":"2026-01-14","n":"Quema De Pastizales","m":"FFFFFFFFFAFFFAFFFFAFFFFAFFFA"},{"t":"Compañía","f":"2026-01-14","n":"Academia Rcp","m":"FFFFFFAFAAFFFAAFFFFAFFAAFAFA"},{"t":"Compañía","f":"2026-01-15","n":"Reunion De Compañía","m":"AAAAAFAAFAAAAAAFAAAAFAAAFAAA"},{"t":"Emergencia","f":"2026-01-16","n":"Quema De Pastizales","m":"FAFFFFFFFFFFAFFFFFAAFFFFFFFF"},{"t":"Emergencia","f":"2026-01-18","n":"Quema De Pastizales","m":"FFFAFFAFFAFFFFAFFFFFFFAFFAFA"},{"t":"Emergencia","f":"2026-01-19","n":"Quema De Pastizales","m":"FAFFFFFFFAFFAFFFFFAFFFFFFFFF"},{"t":"Compañía","f":"2026-01-22","n":"Limpieza Contenedor","m":"FFFFFFFAFFFFFFAFFFFFFFFFFFFF"},{"t":"Emergencia","f":"2026-01-23","n":"Quema Plantacion De Pinos","m":"FFFFFFFFFFFFAAAFFFFFFFFFFFFA"},{"t":"Emergencia","f":"2026-01-24","n":"Guardia Club Aereo","m":"AFFFFFAAFAAFFFFFFFFAFFAAFFFA"},{"t":"Emergencia","f":"2026-01-24","n":"Quema Plantacion De Pinos","m":"AFFFFFAAFAFFFFFFFFFAFFAAFFFA"},{"t":"Compañía","f":"2026-01-28","n":"Academia Online","m":"AAAAAFAAFAAAAAAAAAAAFAAAFAAA"},{"t":"Compañía","f":"2026-02-02","n":"Reunion Extraordinaria","m":"AAAAFFAAAAAFFAAFFFAFFFAAFAAA"},{"t":"Emergencia","f":"2026-02-04","n":"Fuego En Vehiculo","m":"AFFFFFAAFFFFAAAFFFFAFFAFFFFA"},{"t":"Compañía","f":"2026-02-04","n":"Academia Equipos Era","m":"FFAFFFFAFAFFFAAFFAFAFFAAFAFA"},{"t":"Emergencia","f":"2026-02-06","n":"Quema De Pastizales","m":"FFFFFFFFFAFFFFFFFAAFFFFAFFFF"},{"t":"Comandancia","f":"2026-02-07","n":"Citacion De Comandancia","m":"FFFAFFFFFAAFFAFFAAAFFFAAFFFA"},{"t":"Emergencia","f":"2026-02-09","n":"Olor Indeterminado En Ambiente","m":"FFFFFFFFFAFFFFFFFFAFFFAAFFFF"},{"t":"Emergencia","f":"2026-02-09","n":"Alarma De Incendio","m":"FAAAFFFAFAFAFAFFFFAAFFAAFAFA"},{"t":"Emergencia","f":"2026-02-11","n":"Humo En Casa Habitacion","m":"FFFAFFFAFAFFAFFFFFFFFFAAFAFF"},{"t":"Compañía","f":"2026-02-11","n":"Academia Intro May Day","m":"FFFFFFFAFAAFFAFFFFFFFFAAFAAA"},{"t":"Compañía","f":"2026-02-18","n":"Ejercicio May Day & Rit","m":"FFFAAFAAFAAFFAFFFFAAFFAAFAAA"},{"t":"Emergencia","f":"2026-02-23","n":"Arbol Que Cae Sobre Tendido Electrico","m":"FFFFFFFFFAFFFAFFFFFFFFAAFFFA"},{"t":"Compañía","f":"2026-02-25","n":"Ejercicio Equipos Era","m":"FFFFFFAAFAAFAAAFFFAFFFAAFAAA"},{"t":"Comandancia","f":"2026-03-04","n":"Citacion De Comandancia","m":"FAAAFFAFFAAFAAAFFFAFFFFAFAFA"},{"t":"Compañía","f":"2026-03-11","n":"Entrenamiento Estandar Anb","m":"FFFFFFAAFFFAFFFFFFFFFFFFFAFF"},{"t":"Compañía","f":"2026-03-18","n":"Ejercicio Busqueda Primaria","m":"FFAFFFAAFAAAAFAFFFFAFFAAFFFF"},{"t":"Emergencia","f":"2026-03-19","n":"Incendio En 3 Viviendas","m":"FFAAFFFAFAFAFAFFFFFAFFAAFFAA"},{"t":"Compañía","f":"2026-03-25","n":"Ejercicio Tecnicas Rit","m":"FAAAFFAAFAAAAAFFAAFAFFAAFAAA"},{"t":"Compañía","f":"2026-04-01","n":"Ejercicio Despliegue De Armadas","m":"FFAAFFFAFAAAFFAFAAFFFFFAFFFF"},{"t":"Emergencia","f":"2026-04-01","n":"Fuga De Gas Desde Cilindro","m":"FFAFFFAAFAFAFFFFFFFAFFFAFFAF"},{"t":"Emergencia","f":"2026-04-03","n":"Incendio En Vivienda","m":"FFAAAFFAFAFAFFFFFFAAFFFFFFAF"},{"t":"Emergencia","f":"2026-04-03","n":"Incendio En Vivienda","m":"FFFAAFFFFAFAFFFFFFFFFFFFFAFF"},{"t":"Emergencia","f":"2026-04-08","n":"Quema De Pastizales","m":"FFFFFFFFFFAAAFFFFFFFFFFFFAFA"},{"t":"Compañía","f":"2026-04-15","n":"Entrenamiento Estandar Anb","m":"FFAAFFFAFAAAFAFFAAFAFFFAFAFA"},{"t":"Emergencia","f":"2026-04-26","n":"Fuego En Vivienda","m":"FFAFFFFFFAAFFAFFAAFFFFFFFFFA"},{"t":"Compañía","f":"2026-04-28","n":"Academia Svb | Anatomia","m":"FAFFFFAFAAAAFAAFAFFAFFFFFAFA"},{"t":"Emergencia","f":"2026-04-29","n":"Principio De Incendio Origen Electrico","m":"AFFFFFFFFFFFAFFFFFAAFFAFFAAF"},{"t":"Emergencia","f":"2026-05-02","n":"Fuego En Vivienda","m":"FAAAFFFFFAAAAFAFAAFFFFAAFFAA"},{"t":"Compañía","f":"2026-05-03","n":"Guardia Diurna Y Capacitacion","m":"FFFFFFAFAAAFFFFFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-03","n":"Fuego En Vivienda","m":"FAAAAFFFFAFFAFFFFAAFFFFFFFAA"},{"t":"Emergencia","f":"2026-05-05","n":"Fuego En Supermercado","m":"FFFFAFFFFAFAAAFFFFAAFFAFFAFA"},{"t":"Compañía","f":"2026-05-06","n":"Academia Svb | Trauma Y Cinematica","m":"FFAAAFAFFAAAAAAFFFFAFFAAFAFF"},{"t":"Emergencia","f":"2026-05-13","n":"Humo En Entretecho","m":"FFFFFFFFFFFAAAFFFFFFFFAFFFFF"},{"t":"Compañía","f":"2026-05-13","n":"Reunion Ordinaria","m":"FFAAFFAAAAAAAFAFFAAAFAAAFAAF"},{"t":"Emergencia","f":"2026-05-16","n":"Fuego En Vivienda","m":"FFFFFFFFFAFAFFFFFFFFFFFAFAFF"},{"t":"Emergencia","f":"2026-05-20","n":"Fuego En Vivienda","m":"FFAAFFFFFAFAAAFFFFFAFFAFFFAA"},{"t":"Compañía","f":"2026-05-20","n":"Entrenamiento Estandar Anb","m":"FFAAFFAFFAFAFAFFFFAAFFAAFFAA"},{"t":"Emergencia","f":"2026-05-20","n":"Quema De Pastizales","m":"FFAAFFAFFAFAFAFFFFAAFFAAFFAA"},{"t":"Emergencia","f":"2026-05-22","n":"Fuego En Entretecho","m":"FFFFFFFFFFFFFAFFFFAFFFFAFFFF"},{"t":"Emergencia","f":"2026-05-24","n":"Fuego En Vivienda","m":"FFFFFFAFFAFAFAFFFFAFFFFFFFFF"},{"t":"Emergencia","f":"2026-05-26","n":"Quema De Pastizales","m":"FFFFFFFFFFFFAAFFFFFFFFFAFFFA"},{"t":"Emergencia","f":"2026-05-26","n":"Quema De Pastizales","m":"FFFFFFFFFAFAAFFFFFAFFFFFFFFF"},{"t":"Emergencia","f":"2026-05-27","n":"Incendio De Buses","m":"FFAFFFFAFAFAAAAFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-28","n":"Humo En Entretecho","m":"FFAFFFFAFFFAAAFFFFFAFFFFFFFF"},{"t":"Emergencia","f":"2026-05-29","n":"Inflamacion Estufa A Pellet","m":"FFFAFFFFAAFFFAFFFFFAFFFAFFFF"},{"t":"Emergencia","f":"2026-05-30","n":"Fuego En Vivienda","m":"FFAFFFFAFAFAFFFFFAAAFFFFAFFF"},{"t":"Emergencia","f":"2026-06-03","n":"Fuego En Vivienda","m":"FFAFFFFAFAFAFFFFFAFAFFAFAFFF"},{"t":"Compañía","f":"2026-06-06","n":"Fuego En Vivienda Con Atrapados","m":"FAFAFFFAFAAAFFAFAFFAFAAAFFAF"},{"t":"Compañía","f":"2026-06-10","n":"Academia Svb | Xabc","m":"FFAAFFFFFAAAFAFFAAAFFFFAFFAA"},{"t":"Comandancia","f":"2026-06-13","n":"Simulacro General Cbv","m":"FAFFFFFFFAFAFFFFFFFFFFFFFFFA"},{"t":"Compañía","f":"2026-06-17","n":"Academia Svb | Evaluacion Secundaria","m":"FAAAFFFFAFFAFFAFFFFAFFAAFAFF"},{"t":"Emergencia","f":"2026-06-18","n":"Olor Indeterminado En Jardin Infantil","m":"FFFFFFFFFFFAFFFFFAFFFFFFFAAF"}]};

const DEFAULT_TIPOS = ["Citación de Compañía","Instrucción","Ejercicio","Curso práctico","Capacitación","Sesión ordinaria","Otro"];
const DEFAULT_CARGOS = ["Director","Secretario","Tesorero","Tesorero General","Capitán","Teniente 1","Teniente 2","Teniente 3","Ayudante","Jefe de Máquinas","Conductor"];
const LEADER_KEYWORDS = ["director","secretari","tesorer","capit","teniente","ayudante","jefe de m","conductor"];

const ROSTER_KEY="roster:v8", TIPOS_KEY="tipos:v2", INDEX_KEY="partes:index:v1", CARGOS_KEY="cargos:v2";
/* La numeracion se corre: al retirarse un voluntario, los siguientes suben un lugar.
   El numero se recalcula por antiguedad sobre los integrantes activos. */
function renumerar(){
  const activos = ROSTER.filter(m=>m.activo!==false).slice().sort((a,b)=>{
    const fa=a.fechaIngreso||FOUNDING_DATE, fb=b.fechaIngreso||FOUNDING_DATE;
    if(fa!==fb) return fa<fb?-1:1;
    return (a.n||9999)-(b.n||9999);
  });
  activos.forEach((m,i)=>{ m.n = i+1; });
  ROSTER.filter(m=>m.activo===false).forEach(m=>{ m.n=null; });
}
async function renumerarYGuardar(){ renumerar(); await saveRoster(); }

let ROSTER=[], TIPOS=[], CARGOS=[], currentRecord={}, currentPartClave=null;

/* ============ UTILIDADES ============ */
function uid(){ return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'id-'+Math.random().toString(36).slice(2)+Date.now(); }
function todayISO(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function fmtDateLong(iso){ if(!iso) return ""; const [y,m,d]=iso.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long",year:"numeric"}); }
function slug(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-zA-Z0-9]+/g,"-").toLowerCase(); }
function esc(s){ return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }
function cargoPriority(c){
  c=(c||"").toLowerCase();
  if(c.includes("tesorer")) return c.includes("general")||c.includes("gral") ? 2.5 : 2;
  for(let i=0;i<LEADER_KEYWORDS.length;i++){ if(c.includes(LEADER_KEYWORDS[i])) return i; }
  return 99;
}
function cargoNumero(c){ const m=(c||"").match(/(\d+)/); return m?parseInt(m[1],10):9999; }

/* Acrónimo del cargo para identificar oficiales en la lista */
const ACRONIMOS=[["director","DIR"],["secretari","SEC"],["tesorer","TES"],["capit","CAP"],["ayudante","AYU"],["conductor","COND"]];
function acronimoCargo(p){
  const c=(p.cargo||"").toLowerCase();
  if(c.includes("tesorer")) return (c.includes("general")||c.includes("gral")) ? "TES GRAL" : "TES";
  if(c.includes("jefe de m")) return "JEFE MQ";
  if(c.includes("teniente")){
    const tenientes=ROSTER.filter(m=>(m.cargo||"").toLowerCase().includes("teniente"))
      .sort((a,b)=>cargoNumero(a.cargo)-cargoNumero(b.cargo));
    const i=tenientes.findIndex(m=>m.id===p.id);
    return i>=0 ? "TTE "+(i+1) : "TTE";
  }
  for(const [k,a] of ACRONIMOS){ if(c.includes(k)) return a; }
  return "";
}
function nombreCompleto(p){ return [p.nombre,p.apellidoPaterno,p.apellidoMaterno].filter(Boolean).join(" "); }

/* Persistencia institucional: el servidor/Neon es la única fuente de verdad.
   Nunca se recuperan datos operativos desde localStorage, sessionStorage o memoria local. */
let STORAGE_MODE="pendiente";
function lsAvailable(){ return false; }
async function sGet(k,f){
  let r;
  try{
    r=await fetch("/api/state/"+encodeURIComponent(k),{cache:"no-store"});
  }catch(error){
    STORAGE_MODE="sin-conexion";
    actualizarAvisoAlmacenamiento();
    throw new Error("GERMANIA no pudo consultar la base central.");
  }
  if(!r.ok){
    STORAGE_MODE="sin-conexion";
    actualizarAvisoAlmacenamiento();
    throw new Error("GERMANIA no pudo consultar la base central ("+r.status+").");
  }
  const data=await r.json();
  STORAGE_MODE="servidor";
  actualizarAvisoAlmacenamiento();
  return data.value!==null && data.value!==undefined ? data.value : f;
}
const TEST_MODE_KEY="germania:test-mode:v1";
const TEST_BASELINE_KEY="germania:test-baseline:v1";
const TEST_AUDIT_KEY="germania:test-audit:v1";
let TEST_INTERNAL_WRITE=false;
async function rawSet(k,v){
  let r;
  try{
    r=await fetch("/api/state/"+encodeURIComponent(k),{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({value:v})});
  }catch(error){
    STORAGE_MODE="sin-conexion";
    actualizarAvisoAlmacenamiento();
    throw new Error("GERMANIA no pudo guardar en la base central.");
  }
  if(!r.ok){
    STORAGE_MODE="sin-conexion";
    actualizarAvisoAlmacenamiento();
    throw new Error("GERMANIA no pudo guardar en la base central ("+r.status+").");
  }
  STORAGE_MODE="servidor";
  actualizarAvisoAlmacenamiento();
  return true;
}
/* El estado del modo prueba casi nunca cambia: se consulta a lo más una vez por
   minuto (y las consultas simultáneas se unen en una sola), no antes de cada guardado. */
let TEST_MODE_CACHE={valor:null,hasta:0}, TEST_MODE_PENDIENTE=null;
function testModeActivo(){
  if(TEST_MODE_CACHE.valor!==null && Date.now()<TEST_MODE_CACHE.hasta) return Promise.resolve(TEST_MODE_CACHE.valor);
  if(!TEST_MODE_PENDIENTE){
    TEST_MODE_PENDIENTE=sGet(TEST_MODE_KEY,{activo:true})
      .then(v=>{ const activo=v.activo!==false; TEST_MODE_CACHE={valor:activo,hasta:Date.now()+60000}; return activo; })
      .finally(()=>{ TEST_MODE_PENDIENTE=null; });
  }
  return TEST_MODE_PENDIENTE;
}
/* Auditoría de uso: los clics se acumulan en memoria y se guardan juntos cada
   30 s (o al ocultar la pantalla), en vez de leer y reescribir toda la lista en
   cada clic. */
let AUDIT_COLA=[], AUDIT_TIMER=null, AUDIT_ENVIANDO=false;
function registrarUso(tipo,detalle){
  const sel=document.getElementById("miVoluntario");
  const p=sel&&sel.value&&typeof ROSTER!=="undefined"?ROSTER.find(x=>String(x.id)===String(sel.value)):null;
  AUDIT_COLA.push({fecha:new Date().toISOString(),tipo,detalle:String(detalle||"").slice(0,160),voluntario:p?nombreCompleto(p):"Sin identificar",id:p?.id||null});
  if(!AUDIT_TIMER) AUDIT_TIMER=setTimeout(vaciarAuditoria,30000);
}
async function vaciarAuditoria(){
  if(AUDIT_TIMER){ clearTimeout(AUDIT_TIMER); AUDIT_TIMER=null; }
  if(AUDIT_ENVIANDO||!AUDIT_COLA.length) return;
  AUDIT_ENVIANDO=true;
  const lote=AUDIT_COLA; AUDIT_COLA=[];
  try{
    const a=await sGet(TEST_AUDIT_KEY,[]);
    a.push(...lote);
    if(a.length>5000) a.splice(0,a.length-5000);
    await rawSet(TEST_AUDIT_KEY,a);
  }catch(e){
    AUDIT_COLA=lote.concat(AUDIT_COLA).slice(-500);
  }finally{
    AUDIT_ENVIANDO=false;
    if(AUDIT_COLA.length&&!AUDIT_TIMER) AUDIT_TIMER=setTimeout(vaciarAuditoria,30000);
  }
}
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="hidden") vaciarAuditoria(); });
async function sSet(k,v){
  if(!TEST_INTERNAL_WRITE && await testModeActivo() && ![TEST_MODE_KEY,TEST_BASELINE_KEY,TEST_AUDIT_KEY].includes(k)){
    TEST_INTERNAL_WRITE=true;
    try{
      const base=await sGet(TEST_BASELINE_KEY,{});
      if(!Object.prototype.hasOwnProperty.call(base,k)){ base[k]=await sGet(k,null); await rawSet(TEST_BASELINE_KEY,base); }
      if(typeof ROSTER_KEY!=="undefined" && k===ROSTER_KEY && Array.isArray(base[k]) && Array.isArray(v)){
        const ids=new Set(v.map(x=>String(x.id)));
        const faltan=base[k].filter(x=>!ids.has(String(x.id)));
        if(faltan.length){ alert("MODO PRUEBA: no se permite eliminar voluntarios de la nómina base."); return false; }
      }
    }finally{ TEST_INTERNAL_WRITE=false; }
  }
  return rawSet(k,v);
}
/* ---- Qué se considera «dato de prueba» (solo lectura) ---- */
const PRUEBA_NOMBRES={parte:"Partes (asistencia y emergencias)",partes:"Índice de partes",guardia:"Guardias registradas",guardias:"Índice de guardias","guardia-inscripcion":"Inscripciones de guardia","guardia-confirmacion":"Confirmaciones de guardia","guardia-plan":"Períodos de guardia",disponibilidad:"Estados de los voluntarios",roster:"Nómina de voluntarios","odd-avisos":"ODD informadas","odd-pdf":"PDF de ODD",oficialidad:"Oficialidad por año","oficialidad-meta":"Oficialidad (detalle)",hoja:"Hojas de servicio",fotos:"Respaldo de fotos"};
async function verDatosPrueba(){
  const out=document.getElementById("pruebaDatos"); if(!out) return; out.textContent="Leyendo…";
  try{
    const base=await sGet(TEST_BASELINE_KEY,{}), claves=Object.keys(base||{}), grupos={};
    claves.forEach(k=>{ const g=k.split(":")[0]; const x=grupos[g]||(grupos[g]={total:0,nuevas:0,mod:0}); x.total++; (base[k]===null||base[k]===undefined)?x.nuevas++:x.mod++; });
    const sembrados=[["guardia:test:enero2026:v1","Guardias de prueba de enero–febrero 2026 (marcadas «REGISTRO TEMPORAL DE PRUEBA»)"],["guardia:test:matriz:v1","Matriz de guardia de prueba"]];
    const est=await Promise.all(sembrados.map(([k])=>sGet(k,false).catch(()=>false)));
    const filas=Object.entries(grupos).sort((a,b)=>b[1].total-a[1].total).map(([g,x])=>`<tr><td>${esc(PRUEBA_NOMBRES[g]||g)}</td><td>${x.total}</td><td>${x.nuevas}</td><td>${x.mod}</td></tr>`).join("");
    out.innerHTML=`<p><b>${claves.length} registro(s)</b> guardados desde que empezó el modo prueba. «Nuevos» no existían antes (por ejemplo, lo que se inscribió o informó desde entonces); «modificados» ya existían y se cambiaron.</p>
      <table style="table-layout:fixed;width:100%;"><thead><tr><th style="width:52%">Tipo de dato</th><th>Total</th><th>Nuevos</th><th>Modif.</th></tr></thead><tbody style="overflow-wrap:anywhere;">${filas||'<tr><td colspan="4">No hay registros marcados.</td></tr>'}</tbody></table>
      <p style="margin-top:12px;"><b>Datos de prueba que sembró el programa:</b></p><ul style="margin:4px 0 0 18px;">${sembrados.map(([k,t],i)=>`<li>${esc(t)}: ${est[i]?"<b>sí están</b>":"no están"}</li>`).join("")}</ul>
      <p class="foot-note" style="margin-top:10px;">Esto es solo una lista para consultar: no borra nada. El botón «Restaurar pruebas» está bloqueado, porque revertiría también los datos reales marcados aquí.</p>`;
  }catch(e){ out.textContent="No se pudo leer: "+((e&&e.message)||e); }
}
on("verPruebaBtn","click",verDatosPrueba);
/* ---- Guardias de prueba: ver y retirar (con respaldo) ---- */
const esGuardiaDePrueba=g=>!!g&&(g.esPrueba===true||/(REGISTRO|MATRIZ) TEMPORAL DE PRUEBA/.test(String(g.novedades||"")));
async function guardiasDePrueba(){
  const idx=await idxGuardias(), out=[];
  for(const it of idx){ const g=await sGet("guardia:"+it.clave,null); if(esGuardiaDePrueba(g)) out.push({it,g}); }
  return out;
}
function gpMsg(t,error){ const m=document.getElementById("gpMsg"); if(m){ m.textContent=t||""; m.style.color=error?"#c92b2b":"inherit"; } }
async function verGuardiasDePrueba(){
  gpMsg("Leyendo…");
  try{ const l=await guardiasDePrueba(); gpMsg(l.length?`Hay ${l.length} guardia(s) de prueba: ${l.map(x=>x.it.fecha||x.it.clave).sort().join(", ")}. Las guardias reales no se tocan.`:"No hay guardias de prueba."); }
  catch(e){ gpMsg("No se pudo leer: "+((e&&e.message)||e),true); }
}
async function retirarGuardiasDePrueba(){
  try{
    const id=document.getElementById("miVoluntario")?.value, yo=ROSTER.find(x=>String(x.id)===String(id));
    if(!yo||!puedeAdministrar(yo)) throw new Error("Solo el Ayudante, el Secretario, el Capitán o el administrador pueden retirar las guardias de prueba. Elige tu nombre en la pantalla principal.");
    if(!MODO_PRUEBA_ABIERTO){ const r=await autenticarOficialidad(String(document.getElementById("gpClave")?.value||"").trim()); if(!r.ok) throw new Error(mensajeOficialidad(r.motivo)); }
    const l=await guardiasDePrueba(); if(!l.length){ gpMsg("No hay guardias de prueba."); return; }
    if(!confirm(`Se retirarán ${l.length} guardia(s) de prueba (${l.map(x=>x.it.fecha||x.it.clave).sort().join(", ")}). Las guardias reales no se tocan. Antes se guarda un respaldo. ¿Continuar?`)) return;
    const clave="guardias:respaldo-prueba:"+todayISO(), resp=Object.assign({},await sGet(clave,{}));
    l.forEach(x=>{ resp[x.it.clave]=x.g; });
    if(!(await rawSet(clave,resp))) throw new Error("No se pudo guardar el respaldo. No se retiró nada.");
    const quitar=new Set(l.map(x=>x.it.clave));
    for(const x of l){ if(!(await rawSet("guardia:"+x.it.clave,null))) throw new Error("No se pudo retirar «"+x.it.clave+"». Lo ya retirado está en el respaldo; vuelve a intentarlo."); }
    const idx=(await idxGuardias()).filter(i=>!quitar.has(i.clave));
    if(!(await rawSet(GUARDIA_IDX,idx))) throw new Error("Se retiraron las guardias pero no se pudo actualizar el índice. Vuelve a intentarlo.");
    gpMsg(`Listo: se retiraron ${l.length} guardia(s) de prueba. Respaldo guardado en «${clave}».`);
  }catch(e){ gpMsg((e&&e.message)||"No se pudo retirar.",true); }
}
on("gpVerBtn","click",verGuardiasDePrueba);
on("gpRetirarBtn","click",retirarGuardiasDePrueba);
const RESTAURAR_PRUEBAS_BLOQUEADO=true;
async function limpiarDatosPrueba(){
  /* BLOQUEADO: la app ya guarda datos reales (inscripciones, ODD, estados…) y esta restauración los borraría junto con los de prueba. */
  if(RESTAURAR_PRUEBAS_BLOQUEADO){ alert("Restaurar pruebas está bloqueado: la app ya tiene datos reales y esta acción los borraría. Para ver qué se considera dato de prueba: Oficiales → Importar / respaldo → «Ver datos de prueba»."); return; }
  if(!confirm("¿Restaurar todos los datos modificados desde que comenzó el MODO PRUEBA? La nómina base y Hojas de Vida se conservarán.")) return;
  const base=await sGet(TEST_BASELINE_KEY,{});
  TEST_INTERNAL_WRITE=true;
  try{ for(const [k,v] of Object.entries(base)) await rawSet(k,v); await rawSet(TEST_BASELINE_KEY,{}); }
  finally{ TEST_INTERNAL_WRITE=false; }
  registrarUso("administracion","Limpieza de datos de prueba"); await vaciarAuditoria();
  alert("Datos de prueba restaurados. Los datos base protegidos permanecen.");
  location.reload();
}
document.addEventListener("click",e=>{
  const b=e.target.closest("button,a,[role=button]");
  if(!b || b.id==="testCleanBtn") return;
  const txt=(b.innerText||b.getAttribute("aria-label")||b.id||"control").trim().replace(/\s+/g," ");
  registrarUso("click",txt);
});

function actualizarAvisoAlmacenamiento(){
  const el=document.getElementById("storageWarn");
  if(!el) return;
  if(STORAGE_MODE==="memoria"){
    el.style.display="block";
    el.innerHTML = esIOS()
      ? 'Este iPhone o iPad no permite guardar datos cuando el archivo se abre desde el propio equipo. '+
        'Puedes usar la aplicación y generar documentos, pero <b>lo que registres se perderá al cerrarla</b>. '+
        'Para que los datos queden guardados, la aplicación debe estar publicada en internet.'
      : 'Vista previa: aquí los datos no se guardan al cerrar. Descarga el archivo y ábrelo en Chrome o Safari para que queden guardados.';
  } else {
    el.style.display="none";
  }
}

/* ============ CARGA ============ */
async function loadAll(){
  /* Todas las lecturas iniciales salen a la vez: el tiempo de carga es el de la
     más lenta, no la suma de las siete. */
  const [rLeida,tiposL,cargosL,svTiposL,mntTiposL,invCatL,ordenL]=await Promise.all([
    sGet(ROSTER_KEY,null),sGet(TIPOS_KEY,null),sGet(CARGOS_KEY,null),sGet(SV_TIPOS_KEY,null),
    sGet(MNT_TIPOS_KEY,null),sGet(INV_CAT_KEY,null),sGet("orden:v1",null)
  ]);
  let r = rLeida;
  // Una base nueva, una respuesta vacía o un dato inválido nunca debe
  // dejar la aplicación sin nómina. En esos casos se inicializa desde
  // la nómina oficial incluida en la aplicación y se persiste en Neon.
  if(!Array.isArray(r) || r.length===0){
    r = SEED.map((s,i)=>({
      id:uid(), n:i+1, clave:s.clave, cargo:s.cargo,
      nombre:s.nombre, apellidoPaterno:s.ap, apellidoMaterno:s.am, rut:s.rut,
      fechaNacimiento:"", fechaIngreso:FOUNDING_DATE, categoria:"Operativo",
      formaIngreso:s.forma||"Ingreso directo", origen:s.origen||"", especialidad:"",
      telefono:s.tel||"", operativoRadio:!!s.op, conductor:!!s.conductor,
      activo:true, cursos:{}, anotaciones:[]
    })).concat(SEED_BAJAS.map(s=>({
      id:uid(), n:null, clave:s.clave, cargo:"Voluntario",
      nombre:s.nombre, apellidoPaterno:s.ap, apellidoMaterno:s.am, rut:s.rut,
      fechaNacimiento:"", fechaIngreso:FOUNDING_DATE, categoria:"Operativo",
      formaIngreso:"Ingreso directo", origen:"", especialidad:"",
      telefono:s.tel||"", operativoRadio:false,
      activo:false, motivoBaja:s.motivo, fechaBaja:"", obsBaja:"", cursos:{}, anotaciones:[]
    })));
    await sSet(ROSTER_KEY,r);
  }
  r.forEach(m=>{ if(!m.cursos) m.cursos={}; });
  ROSTER=r;
  TIPOS = tiposL || DEFAULT_TIPOS.slice();
  CARGOS = cargosL || DEFAULT_CARGOS.slice();
  SV_TIPOS = svTiposL || DEFAULT_SV_TIPOS.slice();
  MNT_TIPOS = mntTiposL || DEFAULT_MNT_TIPOS.slice();
  INV_CATEGORIAS = invCatL || DEFAULT_INV_CATEGORIAS.slice();
  ORDEN_MODO = ordenL || "oficialidad";
  renumerar();
}
async function saveRoster(){ await sSet(ROSTER_KEY,ROSTER); }
async function saveTipos(){ await sSet(TIPOS_KEY,TIPOS); }
async function saveCargos(){ await sSet(CARGOS_KEY,CARGOS); }

/* Correlativo unico por tipo de PDF y por año. Reinicia solo cada 1 de enero,
   porque la clave incluye el año. */
function anioDe(fechaIso){ return String(fechaIso||"").slice(0,4) || String(new Date().getFullYear()); }
async function siguienteCorrelativo(tipo,anio){
  const clave="correlativo:"+tipo+":"+anio;
  const actual=(await sGet(clave,{actual:0})).actual||0;
  const nuevo=actual+1;
  await sSet(clave,{actual:nuevo});
  return nuevo;
}
async function correlativoActual(tipo,anio){
  return (await sGet("correlativo:"+tipo+":"+anio,{actual:0})).actual||0;
}
async function ajustarCorrelativo(tipo,anio,numero,fotoBase64,oficial){
  await sSet("correlativo:"+tipo+":"+anio,{actual:numero});
  const historial=await sGet("correlativoAjustes:"+tipo+":"+anio,[]);
  historial.push({numero,foto:fotoBase64||null,oficial:oficial||"",fecha:new Date().toISOString()});
  await sSet("correlativoAjustes:"+tipo+":"+anio,historial);
}

const ETIQUETA_CORRELATIVO={parte:"Parte de Asistencia",servicio:"Hoja de Servicio B-5"};
async function renderCorrelativoResumen(){
  const box=document.getElementById("correlativoResumen"); if(!box) return;
  const anio=String(new Date().getFullYear());
  const inpAnio=document.getElementById("correlativoAnioAjuste"); if(inpAnio && !inpAnio.value) inpAnio.value=anio;
  const partes=await correlativoActual("parte",anio);
  const servicios=await correlativoActual("servicio",anio);
  box.innerHTML=`
    <div class="summary-item"><div class="big">${String(partes).padStart(3,"0")}</div><div class="lbl">Parte de Asistencia · ${anio}</div></div>
    <div class="summary-item"><div class="big">${String(servicios).padStart(3,"0")}</div><div class="lbl">Hoja de Servicio B-5 · ${anio}</div></div>`;
}
function leerFotoBase64(file){
  return new Promise((resolve,reject)=>{
    if(!file){ resolve(null); return; }
    const r=new FileReader();
    r.onload=()=>resolve(r.result);
    r.onerror=reject;
    r.readAsDataURL(file);
  });
}
on("correlativoAjustarBtn","click",async()=>{
  const msg=document.getElementById("correlativoMsg"); msg.classList.remove("err");
  const tipo=document.getElementById("correlativoTipoAjuste").value;
  const anio=document.getElementById("correlativoAnioAjuste").value.trim();
  const numero=Number(document.getElementById("correlativoNumeroAjuste").value);
  const oficial=document.getElementById("correlativoOficial").value.trim();
  const fotoInput=document.getElementById("correlativoFoto");
  if(!/^\d{4}$/.test(anio)){ msg.textContent="Indica un año válido."; msg.classList.add("err"); return; }
  if(!Number.isFinite(numero)||numero<0){ msg.textContent="Indica el último número usado (0 si aún no llevas ninguno)."; msg.classList.add("err"); return; }
  if(!fotoInput.files[0]){ msg.textContent="Debes adjuntar la foto de respaldo del cuaderno físico."; msg.classList.add("err"); return; }
  if(!oficial){ msg.textContent="Indica el código del oficial que autoriza este ajuste."; msg.classList.add("err"); return; }
  const foto=await leerFotoBase64(fotoInput.files[0]);
  await ajustarCorrelativo(tipo,anio,numero,foto,oficial);
  msg.textContent=`Listo. ${ETIQUETA_CORRELATIVO[tipo]} de ${anio} continuará desde el N° ${numero+1}.`;
  document.getElementById("correlativoNumeroAjuste").value="";
  fotoInput.value="";
  await renderCorrelativoResumen();
  await renderCorrelativoHistorial();
});
async function renderCorrelativoHistorial(){
  const box=document.getElementById("correlativoHistorial"); if(!box) return;
  const tipo=document.getElementById("correlativoTipoAjuste").value;
  const anio=document.getElementById("correlativoAnioAjuste").value.trim()||String(new Date().getFullYear());
  const ajustes=await sGet("correlativoAjustes:"+tipo+":"+anio,[]);
  if(!ajustes.length){ box.innerHTML=""; return; }
  box.innerHTML="<h3>Historial de ajustes — "+esc(ETIQUETA_CORRELATIVO[tipo])+" "+esc(anio)+"</h3>"+
    ajustes.slice().reverse().map(a=>`
      <div class="hist-item">
        <div>
          <div class="hist-date">Ajustado a N° ${a.numero}</div>
          <div class="hist-acto">Oficial ${esc(a.oficial||"—")} · ${new Date(a.fecha).toLocaleString("es-CL")}</div>
        </div>
        ${a.foto?`<img src="${a.foto}" alt="Respaldo" style="max-width:70px;max-height:70px;border-radius:6px;border:1px solid #3a2f26;">`:""}
      </div>`).join("");
}
on("correlativoTipoAjuste","change",renderCorrelativoHistorial);
on("correlativoAnioAjuste","change",renderCorrelativoHistorial);

/* ============ SECCIONES PLEGABLES EN CELULAR (Salida B-5) ============ */
(function initSeccionesPlegables(){
  const movil=window.matchMedia&&window.matchMedia("(max-width:700px)").matches;
  if(!movil) return;
  const titulos=["Lugar del servicio","Mando","Datos de la emergencia"];
  document.querySelectorAll("#panel-servicio .card").forEach(card=>{
    const h=card.querySelector("h2"); if(!h||!titulos.includes(h.textContent.trim())) return;
    const hijos=[...card.children].filter(x=>x!==h);
    const flecha=document.createElement("span"); flecha.style.cssText="float:right;color:#c9a227;";
    h.appendChild(flecha); h.style.cursor="pointer";
    const set=abierto=>{ hijos.forEach(x=>x.style.display=abierto?"":"none"); flecha.textContent=abierto?"▾":"▸ tocar para abrir"; };
    set(false);
    h.addEventListener("click",()=>set(hijos[0].style.display==="none"));
  });
})();

/* ============ BUSCADOR TRANSVERSAL DE PERSONAS ============ */
function etiquetaBusqueda(p){ return `${nombreCompleto(p)} (${p.clave||"s/c"})`; }
function renderBuscadorOpciones(){
  const dl=document.getElementById("buscadorList"); if(!dl) return;
  dl.innerHTML=sortedRoster(true).map(p=>`<option value="${esc(etiquetaBusqueda(p))}"></option>`).join("");
}
function irASubtab(sub){ const b=document.querySelector(`.subtab[data-sub="${sub}"]`); if(b) b.click(); }
async function renderFichaRapida(){
  const inp=document.getElementById("buscadorInput"), box=document.getElementById("fichaRapida");
  if(!inp||!box) return;
  const q=inp.value.trim();
  if(!q){ box.innerHTML=""; return; }
  const m=ROSTER.find(p=>etiquetaBusqueda(p)===q) || ROSTER.find(p=>nombreCompleto(p).toLowerCase()===q.toLowerCase());
  if(!m){ box.innerHTML='<div class="empty">Elige una persona de la lista de sugerencias.</div>'; return; }
  const hoyAnio=new Date().getFullYear();
  const anios=m.fechaIngreso?Math.floor((new Date()-new Date(m.fechaIngreso+"T12:00:00"))/(365.25*86400000)):null;
  const epp=(await getEppPersonal()).filter(x=>String(x.voluntarioId)===String(m.id));
  const porAnio=await calcularAsistenciaPorAnio(m);
  let pres=0,tot=0; Object.values(porAnio).forEach(v=>{ pres+=v.pres; tot+=v.pres+v.just+v.aus; });
  const pct=tot?Math.round(pres/tot*100):null;
  const eppHtml=epp.length?epp.map(x=>{ const v=calcVencimientoInv(x);
      return `<div style="font-size:13px;margin:2px 0;">${esc(x.tipo)}${x.marca?" · "+esc(x.marca):""} — ${esc(x.estado)}${v?(v.vencido?` <b style="color:#f2a7a0;">(vencido ${v.venceAnio})</b>`:` (vence ${v.venceAnio})`):""}</div>`; }).join("")
    : '<div style="font-size:13px;color:#a89584;">Sin EPP registrado.</div>';
  const notas=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha<b.fecha?1:-1)).slice(0,3)
    .map(a=>`<div style="font-size:13px;margin:2px 0;">${esc(a.fecha||"")} · ${esc(a.detalle||"")}</div>`).join("") || '<div style="font-size:13px;color:#a89584;">Sin anotaciones.</div>';
  box.innerHTML=`
    <div class="summary-row">
      <div class="summary-item"><div class="big">${anios===null?"—":anios}</div><div class="lbl">Años de servicio</div></div>
      <div class="summary-item"><div class="big">${pct===null?"—":pct+"%"}</div><div class="lbl">Asistencia total</div></div>
      <div class="summary-item"><div class="big">${m.conductor?"Sí":"No"}</div><div class="lbl">Conductor</div></div>
    </div>
    <div style="margin:8px 0;"><b>${esc(nombreCompleto(m))}</b> · Cargo: ${esc(m.cargo||"—")} · ${esc(m.categoria||"")} ${m.activo===false?"· <b>De baja</b>":""}</div>
    <h3>Equipo (EPP)</h3>${eppHtml}
    <h3>Últimas anotaciones</h3>${notas}
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
      <button class="btn small" id="fichaAbrirHoja">Abrir hoja de vida</button>
      <button class="btn small secondary" id="fichaAbrirEpp">Ver / editar su EPP</button>
    </div>`;
  document.getElementById("fichaAbrirHoja").onclick=()=>{ irASubtab("hoja"); document.getElementById("hvMiembro").value=m.id; renderHoja(); };
  document.getElementById("fichaAbrirEpp").onclick=()=>{ irASubtab("eppPersonal"); const f=document.getElementById("eppFiltroVoluntario"); if(f){ f.value=m.id; } const v=document.getElementById("eppVoluntario"); if(v){ v.value=m.id; } renderEppLista(); };
}
on("buscadorInput","input",renderFichaRapida);
on("buscadorInput","change",renderFichaRapida);

/* ============ PANEL DE ALERTAS ============ */
async function calcularAlertas(){
  const A=[]; // {nivel:"urgente"|"proxima", area, texto}
  const hoyAnio=new Date().getFullYear(), hoy=new Date();
  const nombreDe=id=>{ const p=ROSTER.find(x=>String(x.id)===String(id)); return p?nombreCompleto(p):"Voluntario eliminado"; };
  // 1) EPP personal
  for(const it of await getEppPersonal()){
    const v=calcVencimientoInv(it), quien=`${nombreDe(it.voluntarioId)} · ${it.tipo}`;
    if(v&&v.vencido) A.push({nivel:"urgente",area:"EPP",texto:`${quien}: vida útil vencida (${v.venceAnio})`});
    else if(v&&v.venceAnio-hoyAnio<=1) A.push({nivel:"proxima",area:"EPP",texto:`${quien}: vence en ${v.venceAnio}`});
    if(it.estado==="Dañado"||it.estado==="Falta") A.push({nivel:"urgente",area:"EPP",texto:`${quien}: ${it.estado.toLowerCase()}`});
    else if(it.estado==="Por reemplazar") A.push({nivel:"proxima",area:"EPP",texto:`${quien}: por reemplazar`});
  }
  // 2) Inventario B-5
  for(const it of await getInventario()){
    const v=calcVencimientoInv(it), q=`${it.codigo?it.codigo+" · ":""}${it.nombre}`;
    if(v&&v.vencido) A.push({nivel:"urgente",area:"Inventario B-5",texto:`${q}: vida útil vencida (${v.venceAnio})`});
    else if(v&&v.venceAnio-hoyAnio<=1) A.push({nivel:"proxima",area:"Inventario B-5",texto:`${q}: vence en ${v.venceAnio}`});
    if(it.estado==="Falta"||it.estado==="Fuera de servicio") A.push({nivel:"urgente",area:"Inventario B-5",texto:`${q}: ${it.estado.toLowerCase()}`});
    else if(it.estado==="En mantención") A.push({nivel:"proxima",area:"Inventario B-5",texto:`${q}: en mantención`});
  }
  // 3) Mantenciones B-5
  const mnts=await getMantenciones();
  Object.keys(MNT_INTERVALO_MESES).forEach(tipo=>{
    const previas=mnts.filter(m=>m.tipo===tipo).sort((a,b)=>a.fecha<b.fecha?1:-1);
    if(!previas.length){ A.push({nivel:"proxima",area:"Mantenciones B-5",texto:`${tipo}: sin ningún registro`}); return; }
    const prox=new Date(previas[0].fecha+"T12:00:00"); prox.setMonth(prox.getMonth()+MNT_INTERVALO_MESES[tipo]);
    const dias=Math.round((prox-hoy)/86400000);
    if(dias<0) A.push({nivel:"urgente",area:"Mantenciones B-5",texto:`${tipo}: vencida desde el ${prox.toLocaleDateString("es-CL")}`});
    else if(dias<=30) A.push({nivel:"proxima",area:"Mantenciones B-5",texto:`${tipo}: corresponde el ${prox.toLocaleDateString("es-CL")}`});
  });
  // 4) Premios de antiguedad (carga los partes una sola vez)
  const minimo=await sGet("premioAsistenciaMinima",75);
  const partes=[]; for(const it of await getIndex()){ const p=await getParte(it.clave); if(p&&p.records) partes.push(p.records); }
  sortedRoster(false).filter(m=>m.fechaIngreso).forEach(m=>{
    const anios=Math.floor((hoy-new Date(m.fechaIngreso+"T12:00:00"))/(365.25*86400000));
    const prox=PREMIO_TIERS.find(t=>t>anios); if(!prox||prox-anios>1) return;
    let pres=0,tot=0; partes.forEach(r=>{ const s=r[m.id]; if(!s) return; tot++; if(s==="presente") pres++; });
    const pct=tot?Math.round(pres/tot*100):0;
    A.push({nivel:pct>=minimo?"proxima":"urgente",area:"Premios",texto:`${nombreCompleto(m)}: premio de ${prox} años (${prox-anios<=0?"este año":"el próximo año"}) · asistencia ${pct}%${pct>=minimo?"":" — bajo el mínimo de "+minimo+"%"}`});
  });
  return A;
}
async function renderAlertas(){
  const res=document.getElementById("alertasResumen"), lista=document.getElementById("alertasLista");
  if(!res||!lista) return;
  lista.innerHTML="Calculando…";
  const A=await calcularAlertas();
  const urg=A.filter(a=>a.nivel==="urgente").length, prox=A.length-urg;
  res.innerHTML=`<div class="summary-item"><div class="big" style="color:#f2a7a0;">${urg}</div><div class="lbl">Urgentes</div></div>
    <div class="summary-item"><div class="big" style="color:#e3c15a;">${prox}</div><div class="lbl">Próximas</div></div>`;
  if(!A.length){ lista.innerHTML='<div class="empty">Sin alertas pendientes. Todo al día ✅</div>'; return; }
  const areas=[...new Set(A.map(a=>a.area))];
  lista.innerHTML=areas.map(ar=>`<h3 style="margin-top:14px;">${esc(ar)}</h3>`+
    A.filter(a=>a.area===ar).sort((a,b)=>a.nivel===b.nivel?0:a.nivel==="urgente"?-1:1).map(a=>
      `<div style="padding:8px 10px;margin:4px 0;border-left:4px solid ${a.nivel==="urgente"?"#b3241c":"#c9a227"};background:${a.nivel==="urgente"?"#2a1210":"#241c08"};border-radius:4px;font-size:13px;">${esc(a.texto)}</div>`).join("")).join("");
}
on("alertasActualizarBtn","click",renderAlertas);

/* ============ EPP PERSONAL POR VOLUNTARIO ============ */
const EPP_KEY="eppPersonal:v1";
function renderEppVoluntarioOptions(){
  const opciones=sortedRoster(false).map(p=>`<option value="${p.id}">${esc(nombreCompleto(p))}</option>`).join("");
  const sel=document.getElementById("eppVoluntario"); if(sel){ const cur=sel.value; sel.innerHTML=opciones; if(cur) sel.value=cur; }
  const fsel=document.getElementById("eppFiltroVoluntario"); if(fsel){ const cur=fsel.value; fsel.innerHTML='<option value="">Todos</option>'+opciones; if(cur) fsel.value=cur; }
}
async function getEppPersonal(){ return await sGet(EPP_KEY,[]); }
function limpiarFormEpp(){
  ["eppMarca","eppAnioFab","eppFechaEntrega","eppVidaUtil","eppObs","eppEditId"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("eppEstado").value="Operativo";
  document.getElementById("eppGuardarBtn").textContent="Guardar entrega";
}
on("eppGuardarBtn","click",async()=>{
  const msg=document.getElementById("eppMsg"); msg.classList.remove("err");
  const voluntarioId=document.getElementById("eppVoluntario").value;
  if(!voluntarioId){ msg.textContent="Selecciona el voluntario."; msg.classList.add("err"); return; }
  const editId=document.getElementById("eppEditId").value;
  const item={
    voluntarioId, tipo:document.getElementById("eppTipo").value,
    marca:document.getElementById("eppMarca").value.trim(),
    anioFab:document.getElementById("eppAnioFab").value.trim(),
    fechaEntrega:document.getElementById("eppFechaEntrega").value,
    vidaUtil:document.getElementById("eppVidaUtil").value.trim(),
    estado:document.getElementById("eppEstado").value,
    obs:document.getElementById("eppObs").value.trim()
  };
  const lista=await getEppPersonal();
  if(editId){ const i=lista.findIndex(x=>x.id===Number(editId)); if(i>-1) lista[i]={id:Number(editId),...item}; }
  else lista.push({id:Date.now(),...item});
  await sSet(EPP_KEY,lista);
  msg.textContent=editId?"Registro actualizado.":"Entrega registrada.";
  limpiarFormEpp();
  await renderEppLista();
});
on("eppFiltroVoluntario","change",renderEppLista);
async function renderEppLista(){
  const box=document.getElementById("eppLista"); if(!box) return;
  const filtro=document.getElementById("eppFiltroVoluntario").value;
  let lista=await getEppPersonal();
  if(filtro) lista=lista.filter(x=>String(x.voluntarioId)===filtro);
  if(!lista.length){ box.innerHTML='<div class="empty">Sin entregas registradas.</div>'; return; }
  const colorEstado={"Operativo":"#284f35","Dañado":"#7d2528","Por reemplazar":"#6b5a22","Falta":"#7d2528"};
  const porVoluntario={};
  lista.forEach(it=>{ (porVoluntario[it.voluntarioId]=porVoluntario[it.voluntarioId]||[]).push(it); });
  const nombreDe=id=>{ const p=ROSTER.find(x=>String(x.id)===String(id)); return p?nombreCompleto(p):"Voluntario eliminado"; };
  box.innerHTML=Object.keys(porVoluntario).sort((a,b)=>nombreDe(a).localeCompare(nombreDe(b),"es")).map(vid=>
    `<h3 style="margin-top:14px;">${esc(nombreDe(vid))}</h3>`+
    porVoluntario[vid].map(it=>{
      const v=calcVencimientoInv(it);
      const vencBadge=v?` <span class="badge" style="background:${v.vencido?"#7d2528":"#284f35"};">${v.vencido?"Vencido ("+v.venceAnio+")":"Vence "+v.venceAnio}</span>`:"";
      return `
      <div class="hist-item">
        <div>
          <div class="hist-date">${esc(it.tipo)} <span class="badge" style="background:${colorEstado[it.estado]||"#3a3d44"};">${esc(it.estado)}</span>${vencBadge}</div>
          <div class="hist-acto">${it.marca?"Marca: "+esc(it.marca):"Marca no registrada"}${it.anioFab?" · Fabricado: "+esc(it.anioFab):""}${it.fechaEntrega?" · Entrega: "+esc(it.fechaEntrega):""}${it.obs?"<br>"+esc(it.obs):""}</div>
        </div>
        <div class="hist-right">
          <button class="btn small secondary" data-epp-edit="${it.id}">Editar</button>
          <button class="btn small secondary" data-epp-del="${it.id}">Eliminar</button>
        </div>
      </div>`;
    }).join("")
  ).join("");
  box.querySelectorAll("[data-epp-edit]").forEach(b=>b.addEventListener("click",async()=>{
    const id=Number(b.dataset.eppEdit);
    const it=(await getEppPersonal()).find(x=>x.id===id); if(!it) return;
    document.getElementById("eppVoluntario").value=it.voluntarioId;
    document.getElementById("eppTipo").value=it.tipo;
    document.getElementById("eppMarca").value=it.marca||"";
    document.getElementById("eppAnioFab").value=it.anioFab||"";
    document.getElementById("eppFechaEntrega").value=it.fechaEntrega||"";
    document.getElementById("eppVidaUtil").value=it.vidaUtil||"";
    document.getElementById("eppEstado").value=it.estado||"Operativo";
    document.getElementById("eppObs").value=it.obs||"";
    document.getElementById("eppEditId").value=it.id;
    document.getElementById("eppGuardarBtn").textContent="Guardar cambios";
  }));
  box.querySelectorAll("[data-epp-del]").forEach(b=>b.addEventListener("click",async()=>{
    if(!confirm("¿Eliminar este registro de EPP?")) return;
    const id=Number(b.dataset.eppDel);
    const lista=(await getEppPersonal()).filter(x=>x.id!==id);
    await sSet(EPP_KEY,lista);
    await renderEppLista();
  }));
}
async function renderEppTodo(){ renderEppVoluntarioOptions(); await renderEppLista(); }

/* ============ INVENTARIO B-5 ============ */
const INV_KEY="inventarioB5:v1", INV_CAT_KEY="invCategorias:v1";
const DEFAULT_INV_CATEGORIAS=["Herramientas menores","Equipos Autónomos (ERA)","Equipo de Protección Personal (EPP)","Mangueras y Coplas","Bombas de Espalda","Ventilación","Motosierras","Otros"];
let INV_CATEGORIAS=[];
const SEED_INVENTARIO_B5=[
  {codigo:"OT-013",nombre:"Motosierra",categoria:"Motosierras",cantidad:1,estado:"Operativo",ubicacion:"",obs:"A bencina/mezcla"},
  {codigo:"",nombre:"Kit de motosierra",categoria:"Motosierras",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Bidón de combustible",categoria:"Motosierras",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Cilindro Scott",categoria:"Equipos Autónomos (ERA)",cantidad:7,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Cilindro MSA",categoria:"Equipos Autónomos (ERA)",cantidad:2,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"ERA Scott (equipo completo)",categoria:"Equipos Autónomos (ERA)",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"ERA MSA (equipo completo)",categoria:"Equipos Autónomos (ERA)",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"VE-002",nombre:"Ventilador Typhoon",categoria:"Ventilación",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Motor a bencina/mezcla"},
  {codigo:"",nombre:"Bichero",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Hacha",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Hacha Plana",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"FO-004",nombre:"Hacha Picota",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Napoleón",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Halligan",categoria:"Herramientas menores",cantidad:2,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Mazo",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"Pala",categoria:"Herramientas menores",cantidad:2,estado:"Operativo",ubicacion:"",obs:""},
  {codigo:"",nombre:"TNT (barretilla/pata de chivo)",categoria:"Herramientas menores",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Confirmar nombre exacto"},
  {codigo:"AG-003",nombre:"Pitón",categoria:"Mangueras y Coplas",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Marca/modelo pendiente de confirmar"},
  {codigo:"AG-037",nombre:"Pitón",categoria:"Mangueras y Coplas",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Marca/modelo pendiente de confirmar"},
  {codigo:"",nombre:"Casco estructural",categoria:"Equipo de Protección Personal (EPP)",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Completar marca, año de fabricación y vida útil"},
  {codigo:"",nombre:"Chaqueta (turnout coat)",categoria:"Equipo de Protección Personal (EPP)",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Completar marca, año de fabricación y vida útil"},
  {codigo:"",nombre:"Jardinera (pantalón/bib)",categoria:"Equipo de Protección Personal (EPP)",cantidad:1,estado:"Operativo",ubicacion:"",obs:"Completar marca, año de fabricación y vida útil"}
];
function renderInvCategoriaOptions(seleccionado){
  const sel=document.getElementById("invCategoria"); if(!sel) return;
  const actual=seleccionado||sel.value;
  sel.innerHTML=ordenarTipos(INV_CATEGORIAS).map(c=>`<option${c===actual?" selected":""}>${esc(c)}</option>`).join("");
}
on("invCategoriaAgregarBtn","click",async()=>{
  const inp=document.getElementById("invCategoriaNueva"); const v=inp.value.trim();
  if(!v||INV_CATEGORIAS.includes(v)){ inp.value=""; return; }
  INV_CATEGORIAS.push(v); await sSet(INV_CAT_KEY,INV_CATEGORIAS);
  renderInvCategoriaOptions(v); inp.value="";
});
async function getInventario(){
  let lista=await sGet(INV_KEY,null);
  if(!lista){
    lista=SEED_INVENTARIO_B5.map((it,i)=>({id:Date.now()+i,...it}));
    await sSet(INV_KEY,lista);
  }
  return lista;
}
function limpiarFormInv(){
  ["invCodigo","invNombre","invUbicacion","invObs","invMarca","invAnioFab","invFechaCompra","invVidaUtil","invEditId"].forEach(id=>document.getElementById(id).value="");
  document.getElementById("invCantidad").value=1;
  document.getElementById("invEstado").value="Operativo";
  document.getElementById("invGuardarBtn").textContent="Guardar ítem";
}
on("invGuardarBtn","click",async()=>{
  const msg=document.getElementById("invMsg"); msg.classList.remove("err");
  const nombre=document.getElementById("invNombre").value.trim();
  if(!nombre){ msg.textContent="Indica al menos el nombre del ítem."; msg.classList.add("err"); return; }
  const editId=document.getElementById("invEditId").value;
  const item={
    codigo:document.getElementById("invCodigo").value.trim(),
    nombre, categoria:document.getElementById("invCategoria").value,
    cantidad:Number(document.getElementById("invCantidad").value)||0,
    estado:document.getElementById("invEstado").value,
    ubicacion:document.getElementById("invUbicacion").value.trim(),
    obs:document.getElementById("invObs").value.trim(),
    marca:document.getElementById("invMarca").value.trim(),
    anioFab:document.getElementById("invAnioFab").value.trim(),
    fechaCompra:document.getElementById("invFechaCompra").value,
    vidaUtil:document.getElementById("invVidaUtil").value.trim()
  };
  const lista=await getInventario();
  if(editId){ const i=lista.findIndex(x=>x.id===Number(editId)); if(i>-1) lista[i]={id:Number(editId),...item}; }
  else lista.push({id:Date.now(),...item});
  await sSet(INV_KEY,lista);
  msg.textContent=editId?"Ítem actualizado.":"Ítem agregado al inventario.";
  limpiarFormInv();
  await renderInvLista();
});
function calcVencimientoInv(it){
  const vida=Number(it.vidaUtil); if(!vida) return null;
  const base=Number(it.anioFab)||(it.fechaCompra?Number(it.fechaCompra.slice(0,4)):null);
  if(!base) return null;
  const venceAnio=base+vida, hoyAnio=new Date().getFullYear();
  return {venceAnio,vencido:hoyAnio>=venceAnio};
}
async function renderInvLista(){
  const box=document.getElementById("invLista"); if(!box) return;
  const lista=await getInventario();
  if(!lista.length){ box.innerHTML='<div class="empty">Inventario vacío.</div>'; return; }
  const colorEstado={"Operativo":"#284f35","En mantención":"#6b5a22","Fuera de servicio":"#7d2528","Falta":"#7d2528"};
  const porCategoria={};
  lista.forEach(it=>{ (porCategoria[it.categoria||"Otros"]=porCategoria[it.categoria||"Otros"]||[]).push(it); });
  box.innerHTML=Object.keys(porCategoria).sort((a,b)=>a.localeCompare(b,"es")).map(cat=>
    `<h3 style="margin-top:14px;">${esc(cat)}</h3>`+
    porCategoria[cat].map(it=>{
      const v=calcVencimientoInv(it);
      const vencBadge=v?` <span class="badge" style="background:${v.vencido?"#7d2528":"#284f35"};">${v.vencido?"Vencido ("+v.venceAnio+")":"Vence "+v.venceAnio}</span>`:"";
      return `
      <div class="hist-item">
        <div>
          <div class="hist-date">${it.codigo?`<span class="badge">${esc(it.codigo)}</span> `:""}${esc(it.nombre)} <span class="badge" style="background:${colorEstado[it.estado]||"#3a3d44"};">${esc(it.estado)}</span>${vencBadge}</div>
          <div class="hist-acto">Cantidad: ${it.cantidad}${it.ubicacion?" · Ubicación: "+esc(it.ubicacion):""}${it.marca?" · Marca: "+esc(it.marca):""}${it.anioFab?" · Fabricado: "+esc(it.anioFab):""}${it.fechaCompra?" · Compra: "+esc(it.fechaCompra):""}${it.obs?"<br>"+esc(it.obs):""}</div>
        </div>
        <div class="hist-right">
          <button class="btn small secondary" data-inv-edit="${it.id}">Editar</button>
          <button class="btn small secondary" data-inv-del="${it.id}">Eliminar</button>
        </div>
      </div>`;
    }).join("")
  ).join("");
  box.querySelectorAll("[data-inv-edit]").forEach(b=>b.addEventListener("click",async()=>{
    const id=Number(b.dataset.invEdit);
    const it=(await getInventario()).find(x=>x.id===id); if(!it) return;
    document.getElementById("invCodigo").value=it.codigo||"";
    document.getElementById("invNombre").value=it.nombre||"";
    renderInvCategoriaOptions(it.categoria);
    document.getElementById("invCantidad").value=it.cantidad||1;
    document.getElementById("invEstado").value=it.estado||"Operativo";
    document.getElementById("invUbicacion").value=it.ubicacion||"";
    document.getElementById("invObs").value=it.obs||"";
    document.getElementById("invMarca").value=it.marca||"";
    document.getElementById("invAnioFab").value=it.anioFab||"";
    document.getElementById("invFechaCompra").value=it.fechaCompra||"";
    document.getElementById("invVidaUtil").value=it.vidaUtil||"";
    document.getElementById("invEditId").value=it.id;
    document.getElementById("invGuardarBtn").textContent="Guardar cambios";
  }));
  box.querySelectorAll("[data-inv-del]").forEach(b=>b.addEventListener("click",async()=>{
    if(!confirm("¿Eliminar este ítem del inventario?")) return;
    const id=Number(b.dataset.invDel);
    const lista=(await getInventario()).filter(x=>x.id!==id);
    await sSet(INV_KEY,lista);
    await renderInvLista();
  }));
}
async function renderInvTodo(){ renderInvCategoriaOptions(); await renderInvLista(); }

/* ============ MANTENCIONES B-5 ============ */
const MNT_TIPOS_KEY="mntTipos:v1", MNT_KEY="mantencionesB5:v1";
const DEFAULT_MNT_TIPOS=["Cambio de aceite y filtro","Filtro de combustible","Filtro de aire","Revisión de frenos",
  "Revisión de neumáticos","Prueba de batería","Purga de refrigerante","Revisión de correas y mangueras","Mantención de bomba/PTO","Otro"];
const MNT_INTERVALO_MESES={"Cambio de aceite y filtro":6,"Filtro de combustible":12,"Filtro de aire":12,
  "Revisión de frenos":6,"Revisión de neumáticos":12,"Prueba de batería":6,"Purga de refrigerante":24,
  "Revisión de correas y mangueras":6,"Mantención de bomba/PTO":12};
let MNT_TIPOS=[];
function renderMntTipoOptions(seleccionado){
  const sel=document.getElementById("mntTipo"); if(!sel) return;
  const actual=seleccionado||sel.value;
  sel.innerHTML=ordenarTipos(MNT_TIPOS).map(t=>`<option${t===actual?" selected":""}>${esc(t)}</option>`).join("");
}
on("mntTipoAgregarBtn","click",async()=>{
  const inp=document.getElementById("mntTipoNuevo"); const v=inp.value.trim();
  if(!v||MNT_TIPOS.includes(v)){ inp.value=""; return; }
  MNT_TIPOS.push(v); await sSet(MNT_TIPOS_KEY,MNT_TIPOS);
  renderMntTipoOptions(v); inp.value="";
});
async function getMantenciones(){ return await sGet(MNT_KEY,[]); }
on("mntGuardarBtn","click",async()=>{
  const msg=document.getElementById("mntMsg"); msg.classList.remove("err");
  const fecha=document.getElementById("mntFecha").value, tipo=document.getElementById("mntTipo").value;
  if(!fecha||!tipo){ msg.textContent="Indica al menos la fecha y el tipo de mantención."; msg.classList.add("err"); return; }
  const registro={id:Date.now(),fecha,tipo,
    km:document.getElementById("mntKm").value.trim(),
    tiempo:document.getElementById("mntTiempo").value.trim(),
    valor:document.getElementById("mntValor").value.trim(),
    repuestos:document.getElementById("mntRepuestos").value.trim(),
    taller:document.getElementById("mntTaller").value.trim(),
    obs:document.getElementById("mntObs").value.trim()};
  const lista=await getMantenciones(); lista.push(registro); await sSet(MNT_KEY,lista);
  msg.textContent="Mantención guardada.";
  ["mntKm","mntTiempo","mntValor","mntRepuestos","mntTaller","mntObs"].forEach(id=>document.getElementById(id).value="");
  await renderMntTodo();
});
function mesFmt(iso){ const d=new Date(iso+"T12:00:00"); return d.toLocaleDateString("es-CL",{month:"long",year:"numeric"}); }
async function renderMntProximas(){
  const box=document.getElementById("mntProximas"); if(!box) return;
  const lista=await getMantenciones();
  const hoy=new Date();
  const filas=Object.keys(MNT_INTERVALO_MESES).map(tipo=>{
    const previas=lista.filter(m=>m.tipo===tipo).sort((a,b)=>a.fecha<b.fecha?1:-1);
    if(!previas.length) return {tipo,estado:"Sin registro previo",color:"#3a3d44"};
    const ultima=previas[0];
    const prox=new Date(ultima.fecha+"T12:00:00"); prox.setMonth(prox.getMonth()+MNT_INTERVALO_MESES[tipo]);
    const diasRestantes=Math.round((prox-hoy)/86400000);
    let estado,color;
    if(diasRestantes<0){ estado=`Vencida desde el ${prox.toLocaleDateString("es-CL")}`; color="#7d2528"; }
    else if(diasRestantes<=30){ estado=`Próxima: ${prox.toLocaleDateString("es-CL")}`; color="#6b5a22"; }
    else { estado=`Al día (próxima: ${prox.toLocaleDateString("es-CL")})`; color="#284f35"; }
    return {tipo,estado,color};
  });
  box.innerHTML="<h3>Próximas mantenciones sugeridas</h3>"+filas.map(f=>
    `<div style="padding:8px 10px;margin:4px 0;background:${f.color};border-radius:6px;font-size:13px;"><b>${esc(f.tipo)}:</b> ${esc(f.estado)}</div>`
  ).join("");
}
async function renderMntHistorial(){
  const box=document.getElementById("mntHistorial"); if(!box) return;
  const lista=(await getMantenciones()).slice().sort((a,b)=>a.fecha<b.fecha?1:-1);
  if(!lista.length){ box.innerHTML='<div class="empty">Aún no hay mantenciones registradas.</div>'; return; }
  box.innerHTML=lista.map(m=>`
    <div class="hist-item">
      <div>
        <div class="hist-date">${fmtDateLong(m.fecha)} <span class="badge">${esc(m.tipo)}</span></div>
        <div class="hist-acto">${m.repuestos?"Repuestos: "+esc(m.repuestos)+" · ":""}${m.taller?"Taller: "+esc(m.taller)+" · ":""}${m.km?"Km: "+esc(m.km)+" · ":""}${m.tiempo?"Tiempo: "+esc(m.tiempo):""}${m.valor?" · Valor: $"+esc(m.valor):""}${m.obs?"<br>"+esc(m.obs):""}</div>
      </div>
      <div class="hist-right"><button class="btn small secondary" data-mnt-del="${m.id}">Eliminar</button></div>
    </div>`).join("");
  box.querySelectorAll("[data-mnt-del]").forEach(b=>b.addEventListener("click",async()=>{
    if(!confirm("¿Eliminar este registro de mantención?")) return;
    const id=Number(b.dataset.mntDel);
    const lista=(await getMantenciones()).filter(m=>m.id!==id);
    await sSet(MNT_KEY,lista);
    await renderMntTodo();
  }));
}
async function renderMntGastoMensual(){
  const box=document.getElementById("mntGastoMensual"); if(!box) return;
  const porMes={};
  function sumar(mesKey,campo,valor){ if(!porMes[mesKey]) porMes[mesKey]={combustible:0,mantencion:0}; porMes[mesKey][campo]+=valor; }
  const idxSv=await sGet(SV_INDEX_KEY,[]);
  for(const it of idxSv){
    const d=await sGet(it.clave,null); if(!d||d.svTipoAct!=="Carga de combustible") continue;
    const fecha=d.svCombFecha||d.svFecha; if(!fecha) continue;
    sumar(fecha.slice(0,7),"combustible",Number(d.svCombValor)||0);
  }
  for(const m of await getMantenciones()){
    if(!m.fecha) continue;
    sumar(m.fecha.slice(0,7),"mantencion",Number(m.valor)||0);
  }
  const meses=Object.keys(porMes).sort((a,b)=>b<a?-1:1);
  if(!meses.length){ box.innerHTML='<div class="empty">Aún no hay cargas de combustible ni mantenciones con valor registrado.</div>'; return; }
  box.innerHTML=`<table><thead><tr><th>Mes</th><th>Combustible</th><th>Mantención</th><th>Total</th></tr></thead><tbody>`+
    meses.map(mk=>{const v=porMes[mk];const total=v.combustible+v.mantencion;
      return `<tr><td>${mesFmt(mk+"-01")}</td><td>$${v.combustible.toLocaleString("es-CL")}</td><td>$${v.mantencion.toLocaleString("es-CL")}</td><td><b>$${total.toLocaleString("es-CL")}</b></td></tr>`;
    }).join("")+`</tbody></table>`;
}
async function renderMntTodo(){ await renderMntProximas(); await renderMntHistorial(); await renderMntGastoMensual(); }

async function getIndex(){ return await sGet(INDEX_KEY,[]); }
async function getParte(c){ return await sGet("parte:"+c,null); }
async function setParte(c,d){
  const ok = await sSet("parte:"+c,d);
  if(ok){ const idx=await getIndex(); if(!idx.find(i=>i.clave===c)){ idx.push({clave:c,date:d.date,tipo:d.tipo}); await sSet(INDEX_KEY,idx); } }
  return ok;
}

/* Fuente única de asistencia institucional.
   Solo registros explícitos generan obligación: citaciones y emergencias B-5.
   Guardia Nocturna queda fuera de este cálculo. */
function origenAsistencia(pt){
  const o=String(pt?.origenAsistencia||"");
  if(o==="emergencia_b5") return {cuenta:true,categoria:"Emergencias"};
  if(o==="comandancia_citacion") return {cuenta:true,categoria:"Comandancia"};
  if(o==="odd_5ta_citacion") return {cuenta:true,categoria:"Actividades de Compañía"};
  if(o==="curso_anb_citacion") return {cuenta:true,categoria:"Cursos ANB"};
  if(o==="citacion_manual") return {cuenta:true,categoria:"Otras"};
  if(o) return {cuenta:false,categoria:"Otras"};
  // Compatibilidad 2026: partes históricos ya eran partes de asistencia.
  // Se conserva su cómputo sin reinterpretar ODD informativas ni Guardia.
  const t=String(pt?.tipo||"").toLowerCase();
  if(t.includes("guardia")) return {cuenta:false,categoria:"Guardia Nocturna"};
  if(t.includes("emergencia")||t.includes("llamado")||t.includes("alarma")) return {cuenta:true,categoria:"Emergencias"};
  if(t.includes("comandancia")) return {cuenta:true,categoria:"Comandancia"};
  if(t.includes("anb")||t.includes("curso")) return {cuenta:true,categoria:"Cursos ANB"};
  return {cuenta:true,categoria:"Otras"};
}
function parteCuentaAsistencia(pt){ return origenAsistencia(pt).cuenta; }
function voluntarioAplicaParte(pt,id){
  if(!parteCuentaAsistencia(pt)) return false;
  const ids=Array.isArray(pt?.eligibleIds)?pt.eligibleIds.map(String):null;
  return !ids || ids.includes(String(id));
}


let ORDEN_MODO = "oficialidad"; // "antiguedad" | "oficialidad"
function sortedRoster(incInactive){
  return ROSTER.filter(m=>incInactive||m.activo!==false).slice().sort((a,b)=>{
    if(ORDEN_MODO==="oficialidad"){
      const pa=cargoPriority(a.cargo), pb=cargoPriority(b.cargo);
      if(pa!==pb) return pa-pb;
      if(pa!==99){
        const na=cargoNumero(a.cargo), nb=cargoNumero(b.cargo);
        if(na!==nb) return na-nb;
      }
    }
    const fa=a.fechaIngreso||FOUNDING_DATE, fb=b.fechaIngreso||FOUNDING_DATE;
    if(fa!==fb) return fa<fb?-1:1;
    return (a.n||9999)-(b.n||9999);
  });
}

/* ============ PASAR LISTA ============ */
function renderTipoSelect(){
  document.getElementById("tipoSelect").innerHTML = TIPOS.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
}
function renderRegistradoPorOptions(){
  document.getElementById("registradoPorOptions").innerHTML =
    sortedRoster(false).map(p=>`<option value="${esc(nombreCompleto(p))}"></option>`).join("");
}
let parteBloqueado=false;
let parteEsNuevo=true, parteNumeroActual=null, parteAnioActual=null;
function renderListaRows(){
  const body=document.getElementById("listaBody"); body.innerHTML="";
  sortedRoster(false).forEach(p=>{
    const st=currentRecord[p.id]||"ausente";
    const ac=acronimoCargo(p);
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.n||""}</td>
      <td class="cargo-col">${esc(p.cargo)}</td>
      <td class="name-col">${p.clave?`<span class="clv">${esc(p.clave)}</span> `:""}${ac?`<span class="ac">${esc(ac)}</span> `:""}${p.conductor?`<span class="cnd">COND</span> `:""}${esc(nombreCompleto(p))}</td>
      <td><div class="seg" data-id="${p.id}">
        <button class="on-presente ${st==='presente'?'active':''}" data-status="presente" ${parteBloqueado?"disabled":""}>Presente</button>
        <button class="on-ausente ${st==='ausente'?'active':''}" data-status="ausente" ${parteBloqueado?"disabled":""}>Ausente</button>
        <button class="on-justificado ${st==='justificado'?'active':''}" data-status="justificado" ${parteBloqueado?"disabled":""}>Justificado</button>
      </div></td>`;
    body.appendChild(tr);
  });
  if(!parteBloqueado) body.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{
    const seg=b.parentElement; currentRecord[seg.dataset.id]=b.dataset.status;
    seg.querySelectorAll("button").forEach(x=>x.classList.remove("active")); b.classList.add("active");
  }));
  const gb=document.getElementById("guardarBtn"), mt=document.getElementById("marcarTodosBtn");
  if(gb) gb.disabled=parteBloqueado; if(mt) mt.disabled=parteBloqueado;
  renderCandadoParte();
}
function renderCandadoParte(){
  let box=document.getElementById("candadoParte");
  if(!box){
    box=document.createElement("div"); box.id="candadoParte";
    const ref=document.getElementById("listaBody")?.closest("table");
    if(ref) ref.parentElement.insertBefore(box,ref);
  }
  if(!parteBloqueado){ box.innerHTML=""; box.style.display="none"; return; }
  box.style.display="block";
  box.style.cssText="padding:12px;margin-bottom:10px;background:#101216;border:1px solid #3a3d44;border-radius:7px;";
  box.innerHTML=`<b>Este parte ya fue guardado y no se puede modificar.</b>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input id="claveDesbloqueoParte" type="password" placeholder="Clave de Oficialidad" style="flex:1;min-width:160px;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">
      <button id="desbloquearParteBtn" class="btn small">Corregir asistencia</button>
    </div>
    <div id="candadoParteMsg" style="margin-top:6px;font-size:12.5px;"></div>`;
  document.getElementById("desbloquearParteBtn").onclick=async()=>{
    const inp=document.getElementById("claveDesbloqueoParte"), m=document.getElementById("candadoParteMsg");
    const res=await autenticarOficialidad(inp.value.trim());
    if(res.ok){
      parteBloqueado=false;
      renderListaRows();
      const gb=document.getElementById("guardarBtn");
      if(gb) gb.textContent="Guardar corrección";
      m.textContent="Asistencia desbloqueada. Corrige y guarda nuevamente; se mantiene el mismo N° de parte.";
      m.classList.remove("err");
    }
    else { m.textContent=mensajeOficialidad(res.motivo); m.classList.add("err"); }
  };
}
function claveFor(d,t){ return d+"__"+slug(t); }
/* Varias actividades del mismo dia y tipo no deben pisarse: se busca una clave libre */
async function claveNueva(d,t){
  const base=claveFor(d,t);
  if(!(await getParte(base))) return base;
  for(let i=2;i<200;i++){
    const k=base+"--"+i;
    if(!(await getParte(k))) return k;
  }
  return base+"--"+Date.now();
}

async function loadListaForSelection(){
  const d=document.getElementById("fecha").value, t=document.getElementById("tipoSelect").value;
  if(!d||!t) return;
  currentPartClave=claveFor(d,t);
  const ex=await getParte(currentPartClave);
  const msg=document.getElementById("statusMsg");
  currentRecord={};
  document.getElementById("resumenBox").style.display="none";
  if(ex&&ex.records){
    currentRecord={...ex.records};
    document.getElementById("detalle").value=ex.detalle||"";
    document.getElementById("registradoPor").value=ex.registradoPor||"";
    msg.textContent="Ya existe un parte guardado para esta fecha y tipo."+(ex.numero?` N° ${String(ex.numero).padStart(3,"0")}/${ex.anio}.`:"");
    parteBloqueado=!MODO_PRUEBA_ABIERTO; parteEsNuevo=false; parteNumeroActual=ex.numero||null; parteAnioActual=ex.anio||null;
  } else {
    sortedRoster(false).forEach(p=>currentRecord[p.id]="ausente");
    document.getElementById("detalle").value="";
    document.getElementById("registradoPor").value="";
    msg.textContent="";
    parteBloqueado=false; parteEsNuevo=true; parteNumeroActual=null; parteAnioActual=null;
  }
  msg.classList.remove("err");
  const gb=document.getElementById("guardarBtn");
  if(gb) gb.textContent="Guardar parte";
  renderListaRows();
}
on("fecha","change",loadListaForSelection);
on("tipoSelect","change",loadListaForSelection);
on("marcarTodosBtn","click",()=>{
  sortedRoster(false).forEach(p=>currentRecord[p.id]="presente"); renderListaRows();
});

function countStatuses(rec){
  const c={presente:0,justificado:0,ausente:0};
  sortedRoster(false).forEach(p=>{ const s=(rec&&rec[p.id])||"ausente"; c[s]=(c[s]||0)+1; });
  return c;
}
function renderResumen(c){
  const total=c.presente+c.justificado+c.ausente;
  document.getElementById("resumenRow").innerHTML=`
    <div class="summary-item"><div class="big">${c.presente}</div><div class="lbl">Presentes</div></div>
    <div class="summary-item"><div class="big">${c.justificado}</div><div class="lbl">Justificados</div></div>
    <div class="summary-item"><div class="big">${c.ausente}</div><div class="lbl">Ausentes</div></div>
    <div class="summary-item"><div class="big">${total?Math.round(c.presente/total*100):0}%</div><div class="lbl">Asistencia</div></div>`;
  document.getElementById("resumenBox").style.display="block";
}

on("guardarBtn","click",()=>{
  if(parteBloqueado) return;
  const date=document.getElementById("fecha").value, tipo=document.getElementById("tipoSelect").value;
  const msg=document.getElementById("statusMsg");
  if(!date||!tipo){ msg.textContent="Selecciona fecha y tipo de citación."; msg.classList.add("err"); return; }
  mostrarConfirmarParte(date,tipo);
});
function mostrarConfirmarParte(date,tipo){
  const c=countStatuses(currentRecord);
  const msg=document.getElementById("statusMsg");
  msg.classList.remove("err");
  msg.innerHTML=`<div style="padding:12px;background:#101216;border:1px solid #3a3d44;border-radius:7px;">
      <b>Revisa antes de guardar:</b> ${c.presente} presentes · ${c.justificado} justificados · ${c.ausente} ausentes.<br/>
      <small>Una vez guardado, este parte no podrá modificarse sin la clave de Oficialidad. ¿Está correcto o quiere revisar de nuevo?</small>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
        <button id="confirmarGuardarBtn" class="btn small">Sí, está correcto — Guardar</button>
        <button id="revisarDeNuevoBtn" class="btn small secondary">Revisar de nuevo</button>
      </div></div>`;
  document.getElementById("revisarDeNuevoBtn").onclick=()=>{ msg.innerHTML=""; };
  document.getElementById("confirmarGuardarBtn").onclick=async()=>{
    const tl=String(tipo||"").toLowerCase();
    const origen=tl.includes("comandancia")?"comandancia_citacion":(tl.includes("anb")||tl.includes("curso"))?"curso_anb_citacion":"citacion_manual";
    const data={date,tipo,detalle:document.getElementById("detalle").value.trim(),registradoPor:document.getElementById("registradoPor").value.trim(),records:currentRecord,origenAsistencia:origen,generaAsistencia:true};
    if(parteEsNuevo){ data.anio=anioDe(date); data.numero=await siguienteCorrelativo("parte",data.anio); }
    else { data.numero=parteNumeroActual; data.anio=parteAnioActual; }
    currentPartClave=claveFor(date,tipo);
    const ok=await setParte(currentPartClave,data);
    if(!ok){ msg.textContent="No se pudo guardar."; msg.classList.add("err"); return; }
    parteBloqueado=!MODO_PRUEBA_ABIERTO; parteEsNuevo=false; parteNumeroActual=data.numero; parteAnioActual=data.anio;
    const gb=document.getElementById("guardarBtn");
    if(gb) gb.textContent="Guardar parte";
    msg.textContent=`Parte guardado. N° ${String(data.numero).padStart(3,"0")}/${data.anio}.`+(MODO_PRUEBA_ABIERTO?" Modo de prueba: edición abierta.":" Ya no se puede modificar sin la clave de Oficialidad.");
    renderResumen(countStatuses(currentRecord));
    renderListaRows();
  };
}

/* ============ PDF ============ */
function pdfHeader(doc,titulo){
  try{ doc.addImage(LOGO_B64,"PNG",14,10,15,19); }catch(e){}
  doc.setFont("helvetica","bold"); doc.setFontSize(14);
  doc.text(titulo,35,18);
  doc.setFont("helvetica","normal"); doc.setFontSize(10);
  doc.text('Quinta Compañía de Bomberos "Germania" de Villarrica',35,24);
  doc.setFontSize(8);
  doc.text("Fundada como Brigada el 21 de junio de 2023 · Compañía desde el 5 de noviembre de 2025",35,28.5);
  doc.setFontSize(10);
}
function buildParteDoc(date,tipo,detalle,records,registradoPor,numero,anio){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"PARTE DE ASISTENCIA"+(numero?` N° ${String(numero).padStart(3,"0")}/${anio}`:""));
  doc.text(`Fecha: ${fmtDateLong(date)}`,14,36);
  doc.text(`Tipo de citación: ${tipo}`,14,42);
  let y=48;
  if(detalle){ doc.text(`Detalle: ${detalle}`,14,y); y+=6; }
  if(registradoPor){ doc.text(`Pasó lista: ${registradoPor}`,14,y); y+=6; }
  // El PDF oficial incluye exclusivamente a quienes estuvieron PRESENTES.
  // Justificados y ausentes se conservan internamente para estadísticas, pero no se imprimen.
  const rows=sortedRoster(false)
    .filter(p=>(records[p.id]||"ausente")==="presente")
    .map(p=>[p.n||"",p.clave||"—",p.cargo,nombreCompleto(p),"Presente"]);
  doc.autoTable({head:[["N°","Clave","Cargo","Nombre","Asistencia"]],body:rows,startY:y,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});
  const c=countStatuses(records), fy=doc.lastAutoTable.finalY+10;
  doc.setFont("helvetica","bold");
  doc.text(`Total presentes: ${c.presente}`,14,fy);
  doc.setFont("helvetica","normal"); doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+10);
  return doc;
}
/* Entrega de archivos compatible con iPhone.
   En iOS, al abrir el archivo desde el propio equipo, Safari bloquea la descarga
   directa y el panel de compartir. Por eso se ofrece siempre un enlace visible
   que el usuario pueda tocar. */
function esIOS(){
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
         (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
}
const CORREO_COMPANIA="germaniacbv@gmail.com";
function mostrarEnlaceArchivo(url,nombre,rotulo,texto){
  let caja=document.getElementById("cajaArchivo");
  if(!caja){
    caja=document.createElement("div");
    caja.id="cajaArchivo";
    caja.style.cssText="position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;"+
      "background:#2a221b;border:1px solid #c9a227;border-radius:10px;padding:14px 16px;"+
      "box-shadow:0 6px 24px rgba(0,0,0,.5);font-family:inherit;";
    document.body.appendChild(caja);
  }
  const asunto=encodeURIComponent((texto||nombre)+' · Quinta Compañía "Germania"');
  const cuerpo=encodeURIComponent(
    (texto||nombre)+"\n\nSe adjunta el documento generado por la aplicación de la Compañía.\n\n"+
    'Quinta Compañía "Germania" · Cuerpo de Bomberos de Villarrica');
  const wa=encodeURIComponent((texto||nombre)+' · Quinta Compañía "Germania"');
  caja.innerHTML=`
    <div style="font-size:13px;color:#a89584;margin-bottom:10px;">${esc(rotulo||"Documento listo")}</div>
    <div style="display:flex;gap:9px;flex-wrap:wrap;align-items:center;">
      <a href="${url}" target="_blank" rel="noopener"
         style="background:#c9a227;color:#241c08;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">Ver documento</a>
      <a href="${url}" download="${esc(nombre)}"
         style="background:#3a2f26;color:#f1ebe0;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">Descargar</a>
      <a href="https://wa.me/?text=${wa}" target="_blank" rel="noopener"
         style="background:#2f6f45;color:#eafaf0;text-decoration:none;font-weight:700;
                padding:10px 16px;border-radius:6px;font-size:14px;">WhatsApp</a>
      <a href="mailto:${CORREO_COMPANIA}?subject=${asunto}&body=${cuerpo}"
         style="background:#2a221b;border:1px solid #3a2f26;color:#f1ebe0;text-decoration:none;
                padding:10px 16px;border-radius:6px;font-size:14px;">Correo</a>
      <button id="cerrarArchivo" style="background:none;border:1px solid #3a2f26;color:#a89584;
              padding:9px 14px;border-radius:6px;font-size:13px;cursor:pointer;">Cerrar</button>
    </div>
    <div style="font-size:11.5px;color:#a89584;margin-top:10px;opacity:.85;line-height:1.5;">
      Toca <b>Ver documento</b> primero para revisar que esté correcto. Si está bien, toca
      <b>Descargar</b> para guardarlo, y luego en WhatsApp o en el correo a ${CORREO_COMPANIA},
      adjunta el archivo descargado a quien corresponda.
    </div>`;
  caja.querySelector("#cerrarArchivo").onclick=()=>caja.remove();
}

async function entregarArchivo(blob,nombre,texto,rotulo){
  const file=new File([blob],nombre,{type:blob.type});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{ await navigator.share({files:[file],title:nombre,text:texto||nombre}); return true; }
    catch(e){ if(e && e.name==="AbortError") return true; }
  }
  const url=URL.createObjectURL(blob);
  mostrarEnlaceArchivo(url,nombre,rotulo,texto);
  setTimeout(()=>URL.revokeObjectURL(url),300000);
  return false;
}

/* Membrete al pie de cada página, igual que en pantalla */
function sellarPdf(doc){
  const total=doc.internal.getNumberOfPages();
  const ancho=doc.internal.pageSize.getWidth();
  const alto=doc.internal.pageSize.getHeight();
  for(let i=1;i<=total;i++){
    doc.setPage(i);
    doc.setDrawColor(200,190,175); doc.setLineWidth(0.3);
    doc.line(14, alto-16, ancho-14, alto-16);
    doc.setFont("helvetica","bold"); doc.setFontSize(7.5); doc.setTextColor(120,110,100);
    doc.text('Desarrollado por la 5ta Compañía "Germania" · Cuerpo de Bomberos de Villarrica · Chile', ancho/2, alto-11, {align:"center"});
    doc.setFont("helvetica","normal"); doc.setFontSize(7);
    doc.text(`Página ${i} de ${total}`, ancho-14, alto-11, {align:"right"});
    doc.setTextColor(0,0,0);
  }
  return doc;
}

function descargarBlob(blob,nombre){
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;
  a.download=nombre;
  a.style.display="none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function downloadPdfDoc(doc,filename){
  sellarPdf(doc);
  descargarBlob(doc.output("blob"),filename);
  return true;
}
async function sharePdfDoc(doc,filename,shareText){
  sellarPdf(doc);
  const blob=doc.output("blob");
  return await entregarArchivo(blob,filename,shareText,"Documento PDF generado");
}
on("pdfBtn","click",async()=>{
  const d=document.getElementById("fecha").value,t=document.getElementById("tipoSelect").value;
  await downloadPdfDoc(buildParteDoc(d,t,document.getElementById("detalle").value.trim(),currentRecord,document.getElementById("registradoPor").value.trim(),parteNumeroActual,parteAnioActual),`Asistencia_${d}_${slug(t)}${parteNumeroActual?"_N"+String(parteNumeroActual).padStart(3,"0"):""}.pdf`);
});
on("waBtn","click",async()=>{
  const d=document.getElementById("fecha").value,t=document.getElementById("tipoSelect").value;
  const rp=document.getElementById("registradoPor").value.trim(), c=countStatuses(currentRecord);
  const text=`Parte de asistencia - Quinta Compañía "Germania"\n${t} - ${fmtDateLong(d)}${rp?"\nPasó lista: "+rp:""}\nPresentes: ${c.presente} · Justificados: ${c.justificado} · Ausentes: ${c.ausente}`;
  const shared=await sharePdfDoc(buildParteDoc(d,t,document.getElementById("detalle").value.trim(),currentRecord,rp,parteNumeroActual,parteAnioActual),`parte_${d}_${slug(t)}.pdf`,text);
  if(!shared) window.open("https://wa.me/?text="+encodeURIComponent(text+"\n(PDF adjunto por separado)"),"_blank");
});

/* ============ HOJA DE SERVICIO B-5 ============ */
const SV_CAMPOS=["svFecha","svTipoAct","svHoraSalida","svHoraLlegada","svHoraControl","svKmSalida","svKmLlegada",
 "svHorometro","svCalle","svNumeracion","svSector","svUnidadCargo","svConductor","svCuerpoCargo","svPuestoMando",
 "svCargoQuinta","svOfContabilidad","svOfSeguridad","svLugarInicio","svNaturaleza","svDetNaturaleza","svOrigen",
 "svDetOrigen","svCausas","svDetCausa","svTipoInmueble","svConstruccion","svNiveles","svObservaciones",
 "svPersonas","svMaterial","svApoyo",
 "svCombConductor","svCombKm","svCombFecha","svCombServicentro","svCombRut","svCombLitros","svCombValor"];
const SV_INDEX_KEY="servicio:index:v1";
async function setServicio(clave,datos){
  const ok=await sSet(clave,datos);
  if(ok){ const idx=await sGet(SV_INDEX_KEY,[]); if(!idx.find(i=>i.clave===clave)){ idx.push({clave,fecha:datos.svFecha,tipo:datos.svTipoAct}); await sSet(SV_INDEX_KEY,idx); } }
  return ok;
}
const SV_TIPOS_KEY="svTipos:v1";
const DEFAULT_SV_TIPOS=["Acto de servicio","Carga de combustible","Ejercicio con material","Emergencia","Mantención","Traslado","Otro"];
let SV_TIPOS=[];
function ordenarTipos(lista){
  const sinOtro=lista.filter(t=>t!=="Otro").sort((a,b)=>a.localeCompare(b,"es"));
  return lista.includes("Otro")?[...sinOtro,"Otro"]:sinOtro;
}
function renderSvTipoOptions(seleccionado){
  const sel=document.getElementById("svTipoAct");
  const actual=seleccionado||sel.value;
  sel.innerHTML=ordenarTipos(SV_TIPOS).map(t=>`<option${t===actual?" selected":""}>${esc(t)}</option>`).join("");
}
on("svTipoActAgregarBtn","click",async()=>{
  const inp=document.getElementById("svTipoActNuevo");
  const v=inp.value.trim();
  if(!v||SV_TIPOS.includes(v)) { inp.value=""; return; }
  SV_TIPOS.push(v);
  await sSet(SV_TIPOS_KEY,SV_TIPOS);
  renderSvTipoOptions(v);
  inp.value="";
  actualizarFichaCombustible();
});
let svConcurrencia={};   // id -> "si" | "no"
let svBloqueado=false;
let svEsNuevo=true, svNumeroActual=null, svAnioActual=null;

function svClave(){
  const f=document.getElementById("svFecha").value;
  const h=document.getElementById("svHoraSalida").value||"sin-hora";
  return "servicio:"+f+"__"+h.replace(":","");
}
function renderSvBody(){
  const body=document.getElementById("svBody"); body.innerHTML="";
  sortedRoster(false).forEach(p=>{
    const st=svConcurrencia[p.id]||"no";
    const ac=acronimoCargo(p);
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.n||""}</td>
      <td class="name-col">${ac?`<span class="ac">${esc(ac)}</span> `:""}${esc(nombreCompleto(p))}</td>
      <td><div class="seg" data-id="${p.id}">
        <button class="on-presente ${st==='si'?'active':''}" data-st="si" ${svBloqueado?"disabled":""}>Concurre</button>
        <button class="on-ausente ${st==='no'?'active':''}" data-st="no" ${svBloqueado?"disabled":""}>No concurre</button>
      </div></td>`;
    body.appendChild(tr);
  });
  if(!svBloqueado) body.querySelectorAll(".seg button").forEach(b=>b.addEventListener("click",()=>{
    const seg=b.parentElement;
    svConcurrencia[seg.dataset.id]=b.dataset.st;
    seg.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    renderSvResumen();
  }));
  const gb=document.getElementById("svGuardarBtn"), lb=document.getElementById("svLimpiarBtn");
  if(gb) gb.disabled=svBloqueado; if(lb) lb.disabled=svBloqueado;
  renderSvResumen();
  renderCandadoSv();
}
function renderCandadoSv(){
  let box=document.getElementById("candadoSv");
  if(!box){
    box=document.createElement("div"); box.id="candadoSv";
    const ref=document.getElementById("svBody")?.closest("table");
    if(ref) ref.parentElement.insertBefore(box,ref);
  }
  if(!svBloqueado){ box.innerHTML=""; box.style.display="none"; return; }
  box.style.display="block";
  box.style.cssText="padding:12px;margin-bottom:10px;background:#101216;border:1px solid #3a3d44;border-radius:7px;";
  box.innerHTML=`<b>Esta hoja de servicio ya fue guardada y no se puede modificar.</b>
    <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input id="claveDesbloqueoSv" type="password" placeholder="Clave de Oficialidad" style="flex:1;min-width:160px;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">
      <button id="desbloquearSvBtn" class="btn small">Corregir hoja</button>
    </div>
    <div id="candadoSvMsg" style="margin-top:6px;font-size:12.5px;"></div>`;
  document.getElementById("desbloquearSvBtn").onclick=async()=>{
    const inp=document.getElementById("claveDesbloqueoSv"), m=document.getElementById("candadoSvMsg");
    const res=await autenticarOficialidad(inp.value.trim());
    if(res.ok){
      svBloqueado=false;
      renderSvBody();
      const gb=document.getElementById("svGuardarBtn");
      if(gb) gb.textContent="Guardar corrección";
      m.textContent="Hoja desbloqueada. Corrige los datos y guarda nuevamente; se mantiene el mismo número.";
      m.classList.remove("err");
    }
    else { m.textContent=mensajeOficialidad(res.motivo); m.classList.add("err"); }
  };
}
function svConteo(){
  let concurrentes=0,no=0;
  sortedRoster(false).forEach(p=>{
    const s=svConcurrencia[p.id]||"no";
    if(s==="si") concurrentes++; else no++;
  });
  return {no,concurrentes};
}
function renderSvResumen(){
  const c=svConteo();
  document.getElementById("svResumen").innerHTML=`
    <div class="summary-item"><div class="big">${c.concurrentes}</div><div class="lbl">Total concurrentes</div></div>
    <div class="summary-item"><div class="big">${c.no}</div><div class="lbl">No concurrió</div></div>`;
}
on("svLimpiarBtn","click",()=>{
  sortedRoster(false).forEach(p=>svConcurrencia[p.id]="no");
  renderSvBody();
});

function svDatos(){
  const d={};
  SV_CAMPOS.forEach(id=>d[id]=document.getElementById(id).value);
  d.concurrencia={...svConcurrencia};
  return d;
}
async function cargarServicio(){
  const clave=svClave();
  const ex=await sGet(clave,null);
  svConcurrencia={};
  const msg=document.getElementById("svMsg");
  if(ex){
    SV_CAMPOS.forEach(id=>{ if(id!=="svFecha"&&ex[id]!==undefined) document.getElementById(id).value=ex[id]; });
    svConcurrencia={...(ex.concurrencia||{})};
    document.getElementById("svRegistrarAsistencia").checked = ex.registrarAsistencia!==false;
    msg.textContent="Ya existe una hoja de servicio guardada para esta fecha y hora de salida."+(ex.numero?` N° ${String(ex.numero).padStart(3,"0")}/${ex.anio}.`:"");
    msg.classList.remove("err");
    svBloqueado=!MODO_PRUEBA_ABIERTO; svEsNuevo=false; svNumeroActual=ex.numero||null; svAnioActual=ex.anio||null;
  } else {
    svBloqueado=false; svEsNuevo=true; svNumeroActual=null; svAnioActual=null;
  }
  sortedRoster(false).forEach(p=>{ if(!svConcurrencia[p.id]) svConcurrencia[p.id]="no"; });
  renderSvTipoOptions();
  actualizarFichaCombustible();
  const gb=document.getElementById("svGuardarBtn");
  if(gb) gb.textContent="Guardar hoja";
  renderSvBody();
}
on("svFecha","change",cargarServicio);
on("svHoraSalida","change",cargarServicio);
function actualizarFichaCombustible(){
  const t=document.getElementById("svTipoAct").value;
  const ficha=document.getElementById("svFichaCombustible");
  const esCombustible=t==="Carga de combustible";
  ficha.style.display=esCombustible?"flex":"none";
  if(esCombustible && !document.getElementById("svCombFecha").value){
    document.getElementById("svCombFecha").value=document.getElementById("svFecha").value;
  }
}
on("svTipoAct","change",()=>{
  const t=document.getElementById("svTipoAct").value;
  document.getElementById("svRegistrarAsistencia").checked = (t==="Emergencia"||t==="Acto de servicio");
  actualizarFichaCombustible();
});

on("svGuardarBtn","click",()=>{
  if(svBloqueado) return;
  const msg=document.getElementById("svMsg");
  const fecha=document.getElementById("svFecha").value;
  if(!fecha){ msg.textContent="Indica la fecha del servicio."; msg.classList.add("err"); return; }
  mostrarConfirmarSv();
});
function mostrarConfirmarSv(){
  const msg=document.getElementById("svMsg"), c=svConteo();
  msg.classList.remove("err");
  msg.innerHTML=`<div style="padding:12px;background:#101216;border:1px solid #3a3d44;border-radius:7px;">
      <b>Revisa antes de guardar:</b> ${c.concurrentes} concurrentes · ${c.no} no concurrió.<br/>
      <small>Una vez guardada, esta hoja no podrá modificarse sin la clave de Oficialidad. ¿Está correcto o quiere revisar de nuevo?</small>
      <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
        <button id="confirmarGuardarSvBtn" class="btn small">Sí, está correcto — Guardar</button>
        <button id="revisarDeNuevoSvBtn" class="btn small secondary">Revisar de nuevo</button>
      </div></div>`;
  document.getElementById("revisarDeNuevoSvBtn").onclick=()=>{ msg.innerHTML=""; };
  document.getElementById("confirmarGuardarSvBtn").onclick=async()=>{
    const fecha=document.getElementById("svFecha").value;
    if(svEsNuevo){ svAnioActual=anioDe(fecha); svNumeroActual=await siguienteCorrelativo("servicio",svAnioActual); }
    const datos=svDatos();
    datos.registrarAsistencia=document.getElementById("svRegistrarAsistencia").checked;
    datos.numero=svNumeroActual; datos.anio=svAnioActual;
    await setServicio(svClave(),datos);
    svEsNuevo=false;
    const numTxt=`N° ${String(svNumeroActual).padStart(3,"0")}/${svAnioActual}. `;

    if(!datos.registrarAsistencia){
      svBloqueado=!MODO_PRUEBA_ABIERTO;
      const gb=document.getElementById("svGuardarBtn");
      if(gb) gb.textContent="Guardar hoja";
      renderSvBody();
      msg.classList.remove("err");
      msg.textContent=`Hoja de servicio guardada. ${numTxt}No se registró asistencia (${c.concurrentes} concurrentes anotados solo en la hoja).`;
      return;
    }

    // Se registra ademas como citacion, para que cuente en el Control de asistencia
    const tipo=document.getElementById("svTipoAct").value+" B-5";
    if(!TIPOS.includes(tipo)){ TIPOS.push(tipo); await saveTipos(); renderTipoSelect(); populateTipoFilters(); }
    const records={};
    sortedRoster(true).forEach(p=>{
      const s=svConcurrencia[p.id]||"no";
      records[p.id] = (s==="no") ? "ausente" : "presente";
    });
    const detalle=[document.getElementById("svCalle").value,document.getElementById("svNumeracion").value,
                   document.getElementById("svSector").value].filter(Boolean).join(" ");
    const detFinal=detalle||document.getElementById("svNaturaleza").value;
    const hs=(document.getElementById("svHoraSalida").value||"s-h").replace(":","");
    const claveSv=claveFor(fecha,tipo)+"__"+hs;
    await setParte(claveSv,{
      date:fecha, tipo, detalle:detFinal,
      registradoPor:document.getElementById("svCargoQuinta").value, records,
      modoConcurrencia:{...svConcurrencia}, numero:svNumeroActual, anio:svAnioActual,
      origenAsistencia:document.getElementById("svTipoAct").value==="Emergencia"?"emergencia_b5":"citacion_manual",
      generaAsistencia:true, servicioB5:true,
      eligibleIds:document.getElementById("svTipoAct").value==="Emergencia"
        ? Object.entries(svConcurrencia).filter(([,v])=>v==="si").map(([id])=>String(id))
        : sortedRoster(false).map(p=>String(p.id))
    });
    svBloqueado=!MODO_PRUEBA_ABIERTO;
    const gb=document.getElementById("svGuardarBtn");
    if(gb) gb.textContent="Guardar hoja";
    renderSvBody();
    msg.classList.remove("err");
    msg.textContent=`Hoja de servicio guardada. ${numTxt}${c.concurrentes} voluntarios concurrieron.`;
  };
}

function buildServicioPdf(){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  const g=id=>document.getElementById(id).value||"—";
  pdfHeader(doc,"HOJA DE SERVICIO · UNIDAD B-5"+(svNumeroActual?` N° ${String(svNumeroActual).padStart(3,"0")}/${svAnioActual}`:""));
  let y=36;
  doc.setFontSize(10);
  doc.text(`Fecha: ${g("svFecha")}    Tipo: ${g("svTipoAct")}`,14,y); y+=2;

  doc.autoTable({startY:y+2,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["Hora salida","Hora llegada","Hora control","Km salida","Km llegada","Horómetro"]],
    body:[[g("svHoraSalida"),g("svHoraLlegada"),g("svHoraControl"),g("svKmSalida"),g("svKmLlegada"),g("svHorometro")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Lugar del servicio",""]],
    body:[["Calle",g("svCalle")],["Numeración",g("svNumeracion")],["Sector",g("svSector")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Mando",""]],
    body:[["Unidad a cargo",g("svUnidadCargo")],["Conductor",g("svConductor")],
          ["Cuerpo a cargo",g("svCuerpoCargo")],["Puesto de mando",g("svPuestoMando")],
          ["A cargo Quinta",g("svCargoQuinta")],["Oficial de contabilidad",g("svOfContabilidad")],
          ["Oficial de seguridad",g("svOfSeguridad")]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+4,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["Datos de la emergencia",""]],
    body:[["Lugar de inicio",g("svLugarInicio")],["Naturaleza",g("svNaturaleza")],["Detalles naturaleza",g("svDetNaturaleza")],
          ["Origen",g("svOrigen")],["Detalles origen",g("svDetOrigen")],["Causas",g("svCausas")],["Detalles causa",g("svDetCausa")],
          ["Tipo de inmueble",g("svTipoInmueble")],["Tipo de construcción",g("svConstruccion")],["N° niveles",g("svNiveles")]]});

  doc.addPage();
  const c=svConteo();
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text("CONCURRENCIA DE VOLUNTARIOS",14,20);
  doc.setFont("helvetica","normal"); doc.setFontSize(10);
  doc.text(`Total concurrentes: ${c.concurrentes}   ·   No concurrió: ${c.no}`,14,27);

  const rows=sortedRoster(false)
    .filter(p=>svConcurrencia[p.id]==="si")
    .map(p=>[p.n||"",acronimoCargo(p)||"—",nombreCompleto(p),"Concurre"]);
  doc.autoTable({head:[["N°","Cargo","Nombre","Concurrencia"]],body:rows,startY:32,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Observaciones",""]],
    body:[["Relato del servicio",g("svObservaciones")],["Personas involucradas",g("svPersonas")],
          ["Material menor utilizado",g("svMaterial")],["Unidades de apoyo",g("svApoyo")]]});

  if(document.getElementById("svTipoAct").value==="Carga de combustible"){
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Ficha de carga de combustible",""]],
      body:[["Conductor",g("svCombConductor")],["Kilometraje actual",g("svCombKm")],
            ["Fecha",g("svCombFecha")],["Servicentro",g("svCombServicentro")],
            ["RUT del servicentro",g("svCombRut")],["Cantidad cargada (L)",g("svCombLitros")],
            ["Valor del petróleo ($)",g("svCombValor")]]});
  }

  let fy=doc.lastAutoTable.finalY+20;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Conductor",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Oficial a cargo",115,fy+5);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+18);
  return doc;
}
function svNombrePdf(){
  const fecha=document.getElementById("svFecha").value||todayISO();
  const numero=svNumeroActual ? "_N"+String(svNumeroActual).padStart(3,"0") : "";
  return `B5_${slug(document.getElementById("svTipoAct").value||"servicio")}_${fecha}${numero}.pdf`;
}
on("svPdfBtn","click",async()=>{
  await downloadPdfDoc(buildServicioPdf(),svNombrePdf());
});
on("svWaBtn","click",async()=>{
  const c=svConteo(), g=id=>document.getElementById(id).value||"";
  const texto=`HOJA DE SERVICIO B-5 · Quinta Compañía "Germania"\n${g("svTipoAct")} · ${g("svFecha")} ${g("svHoraSalida")}\nLugar: ${[g("svCalle"),g("svNumeracion"),g("svSector")].filter(Boolean).join(" ")}\nNaturaleza: ${g("svNaturaleza")}\n\nConcurrieron ${c.concurrentes} voluntarios.`;
  const shared=await sharePdfDoc(buildServicioPdf(),`hoja_servicio_b5_${g("svFecha")||todayISO()}.pdf`,texto);
  if(!shared) window.open("https://wa.me/?text="+encodeURIComponent(texto),"_blank");
});

/* ============ PLANIFICACIÓN INTEGRAL DE GUARDIA ============ */
const GN_PLAN_INDEX="guardia-plan:index";
let gnPlanMes=new Date(), gnPlanDraft=null, gnVolSel=new Set();

function gnISO(d){ const x=new Date(d); x.setMinutes(x.getMinutes()-x.getTimezoneOffset()); return x.toISOString().slice(0,10); }
function gnAdd(iso,n){ const d=new Date(iso+"T12:00:00"); d.setDate(d.getDate()+n); return gnISO(d); }
function gnPlanKey(ini){ return "guardia-plan:"+ini; }
async function gnPlanes(){ const idx=await sGet(GN_PLAN_INDEX,[]), out=[]; for(const x of idx){ const p=await sGet(gnPlanKey(x),null); if(p) out.push(p); } return out; }
async function gnSavePlan(p){ await sSet(gnPlanKey(p.inicio),p); const idx=await sGet(GN_PLAN_INDEX,[]); if(!idx.includes(p.inicio)){ idx.push(p.inicio); idx.sort(); await sSet(GN_PLAN_INDEX,idx); } }
function gnWeek(ini){ return Array.from({length:7},(_,i)=>gnAdd(ini,i)); }
function gnFmt(iso){ return new Date(iso+"T12:00").toLocaleDateString("es-CL",{weekday:"short",day:"2-digit",month:"2-digit"}); }

async function renderGnPlanner(){
 const cal=document.getElementById("gnCalendario"); if(!cal) return;
 const y=gnPlanMes.getFullYear(),m=gnPlanMes.getMonth();
 document.getElementById("gnMesTitulo").textContent=new Date(y,m,1).toLocaleDateString("es-CL",{month:"long",year:"numeric"});
 const planes=await gnPlanes(); const byDay={};
 planes.forEach(p=>gnWeek(p.inicio).forEach((d,i)=>{byDay[d]={p,i};}));
 const first=new Date(y,m,1), offset=(first.getDay()+6)%7, begin=new Date(y,m,1-offset);
 let html="";
 for(let i=0;i<42;i++){ const d=new Date(begin); d.setDate(begin.getDate()+i); const iso=gnISO(d), rec=byDay[iso]; let cls="gn-day"+(d.getMonth()!==m?" other":"");
   let mini="";
   if(rec){ const p=rec.p; if(p.estado==="suspendida"){cls+=" red";mini="Suspendida";} else if(p.estado==="asignacion"){cls+=" red";mini="Asignación";} else if(p.estado==="abierta"){cls+=" open";mini="Inscripción";} else {cls+=" plan"; if(p.completa) cls+=" complete"; mini="Nocturna";}
     if(rec.i===4 && p.domingoDiurno){ cls=cls.replace(/\bplan\b|\bopen\b/g,"")+" mixed"; mini="Nocturna + Diurna"; }
   }
   if(gnPlanDraft && gnWeek(gnPlanDraft.inicio).includes(iso)){cls=cls.replace(/\bopen\b|\bred\b/g,"")+" plan"; if(iso===gnAdd(gnPlanDraft.inicio,4)&&gnPlanDraft.domingoDiurno) cls+=" mixed";}
   html+=`<button type="button" class="${cls}" data-gn-date="${iso}">${d.getDate()}<span class="mini">${mini}</span></button>`;
 }
 cal.innerHTML=html;
 cal.querySelectorAll("[data-gn-date]").forEach(b=>b.onclick=()=>gnElegirSemana(b.dataset.gnDate));
 renderGnPeriodo(); await renderGnVoluntario();
 await Promise.allSettled([renderGnRolSemanal(),renderGnObac(),renderGnMandoResumen()]);
}
function gnElegirSemana(iso){
 const d=new Date(iso+"T12:00"); if(d.getDay()!==3){ const msg=document.getElementById("gnPlanMsg"); msg.textContent="La semana normal comienza un miércoles. Toca el miércoles correspondiente."; return; }
 gnPlanDraft={inicio:iso,fin:gnAdd(iso,7),domingoDiurno:false,lugarDomingo:"domicilio",actividad:"",estado:"planificacion",confirmado:false};
 document.getElementById("gnDomingoDiurno").checked=false; document.getElementById("gnDomingoOpciones").style.display="none"; renderGnPlanner();
}
function renderGnPeriodo(){
 const box=document.getElementById("gnPeriodoResumen"); if(!box) return;
 if(!gnPlanDraft){box.textContent="Toca un miércoles para seleccionar la semana.";return;}
 box.innerHTML=`<b>Período seleccionado</b><br>${gnFmt(gnPlanDraft.inicio)} 23:00 → ${gnFmt(gnPlanDraft.fin)} 07:00<br><small>7 turnos de Guardia Nocturna${gnPlanDraft.domingoDiurno?" + Guardia Diurna domingo":""}</small>`;
}
on("gnPrevMes","click",()=>{gnPlanMes=new Date(gnPlanMes.getFullYear(),gnPlanMes.getMonth()-1,1);renderGnPlanner();});
on("gnNextMes","click",()=>{gnPlanMes=new Date(gnPlanMes.getFullYear(),gnPlanMes.getMonth()+1,1);renderGnPlanner();});
on("gnBorrarSemana","click",()=>{gnPlanDraft=null;document.getElementById("gnDomingoDiurno").checked=false;document.getElementById("gnDomingoOpciones").style.display="none";document.getElementById("gnPlanMsg").textContent="Selección borrada.";renderGnPlanner();});
on("gnDomingoDiurno","change",e=>{if(!gnPlanDraft){e.target.checked=false;return;}gnPlanDraft.domingoDiurno=e.target.checked;document.getElementById("gnDomingoOpciones").style.display=e.target.checked?"block":"none";renderGnPlanner();});
document.querySelectorAll("[data-gn-lugar]").forEach(b=>b.addEventListener("click",()=>{if(!gnPlanDraft)return;gnPlanDraft.lugarDomingo=b.dataset.gnLugar;document.querySelectorAll("[data-gn-lugar]").forEach(x=>x.classList.toggle("active",x===b));document.getElementById("gnActividadWrap").style.display=b.dataset.gnLugar==="cuartel"?"block":"none";}));
on("gnActividad","input",e=>{if(gnPlanDraft)gnPlanDraft.actividad=e.target.value;});
on("gnConfirmarPeriodo","click",async()=>{
 const msg=document.getElementById("gnPlanMsg"); if(!gnPlanDraft){msg.textContent="Selecciona primero un miércoles.";return;}
 const cv=document.getElementById("gnCierrePeriodo")?.value;
  const cierre=new Date(cv?instanteChile(cv.slice(0,10),cv.slice(11,16)):instanteChile(gnAdd(gnPlanDraft.inicio,-1),"19:00")).toISOString();   /* por omisión: el martes anterior, 19:00 */
  const p={...gnPlanDraft,estado:"abierta",confirmado:true,creadoEn:new Date().toISOString(),horaInicio:"23:00",horaFin:"08:00",cierre};
 await gnSavePlan(p); gnPlanDraft=null; msg.textContent="Período confirmado. Inscripción abierta."; await renderGnPlanner();
});
/* ============ INSCRIPCIÓN A LA GUARDIA · cuadro individual del voluntario ============
   Cada voluntario ve solo sus 7 noches. Confirma con «¿Estás seguro?» y el cuadro desaparece.
   Mínimo: 2 noches; si marca una sola puede agregar otra, confirmar así o justificar por correo (no se bloquea nada). */
let GN_INS_SEL=new Set(), GN_INS_CLAVE="", GN_INS_CACHE=null;
function gnInsCierreMs(p){ const t=p.cierre?Date.parse(p.cierre):NaN; return Number.isNaN(t)?instanteChile(gnAdd(p.inicio,-1),"19:00"):t; }
async function gnConteosSemana(p){
  const dias=gnWeek(p.inicio), conteos=Object.fromEntries(dias.map(d=>[d,0]));
  const lecturas=await Promise.all(ROSTER.filter(x=>x.activo!==false).map(async m=>{
    try{return await sGet("guardia-inscripcion:"+p.inicio+":"+m.id,[]);}catch(e){return [];}
  }));
  lecturas.forEach(noches=>(Array.isArray(noches)?noches:[]).forEach(d=>{
    if(Object.prototype.hasOwnProperty.call(conteos,d)) conteos[d]++;
  }));
  return conteos;
}
async function gnInsDatos(who,forzar){
  const ahora=Date.now();
  if(!forzar&&GN_INS_CACHE&&GN_INS_CACHE.who===who&&ahora<GN_INS_CACHE.hasta) return GN_INS_CACHE;
  const planes=await gnPlanes();
  const p=planes.filter(x=>x.estado==="abierta"&&x.confirmado!==false&&ahora<gnInsCierreMs(x)).sort((a,b)=>a.inicio.localeCompare(b.inicio))[0]||null;
  let saved=[],conf=null,conteos={};
  if(p){ [saved,conf,conteos]=await Promise.all([sGet("guardia-inscripcion:"+p.inicio+":"+who,[]),sGet("guardia-confirmacion:"+p.inicio+":"+who,null),gnConteosSemana(p)]); }
  GN_INS_CACHE={who,p,saved:Array.isArray(saved)?saved:[],conf,conteos,hasta:ahora+60000}; return GN_INS_CACHE;
}
async function renderGnInscripcionCard(forzar){
  const box=document.getElementById("gnInscripcionCard"); if(!box) return;
  const who=document.getElementById("miVoluntario")?.value;
  if(!who){ box.innerHTML=""; return; }
  let d; try{ d=await gnInsDatos(who,forzar); }catch(e){ return; }
  const {p,saved,conf,conteos={}}=d;
  if(!p||Date.now()>=gnInsCierreMs(p)||(conf&&(conf.cumple||conf.justificacion))){ if(box.innerHTML) box.innerHTML=""; return; }
  const clave=p.inicio+":"+who; if(GN_INS_CLAVE!==clave){ GN_INS_CLAVE=clave; GN_INS_SEL=new Set(saved); }
  const dias=gnWeek(p.inicio), hasta=gnInsCierreMs(p);
  const cierreTxt=new Date(hasta).toLocaleString("es-CL",{weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"America/Santiago"}).replace(".","");
  const nom=iso=>new Date(iso+"T12:00").toLocaleDateString("es-CL",{weekday:"short"}).replace(".","");
  const sel=[...GN_INS_SEL].sort(); const n=sel.length;
  const yo=ROSTER.find(x=>String(x.id)===String(who));
  const cargoYo=precN(yo?.cargo||"");
  const puedeVerRefuerzo=cargoYo.includes("capitan")||cargoYo.includes("teniente tercero")||cargoYo.includes("teniente 3");
  const reforzadas=dias.filter(f=>(conteos[f]||0)>4);
  box.innerHTML=`<div class="card" style="min-width:0;margin-bottom:12px;">
    <h2 style="margin:0;">Guardia nocturna · elige tus noches</h2>
    <p class="sub" style="margin:4px 0 0;">Semana ${esc(gnFmt(p.inicio))} 23:00 → ${esc(gnFmt(gnAdd(p.inicio,7)))} 08:00 · solo presencial, en el cuartel.<br>Cierra el <b>${esc(cierreTxt)}</b> · faltan ${esc(avisoRestante(hasta,Date.now()))}.</p>
    <div class="gi-noches">${dias.map(f=>`<button type="button" class="gi-n ${GN_INS_SEL.has(f)?"on":""}" data-gi="${f}"><b>${esc(nom(f))}</b><span>${f.slice(8)}</span><small class="gn-coverage">${conteos[f]||0} voluntario${(conteos[f]||0)===1?"":"s"}</small></button>`).join("")}</div>
    ${puedeVerRefuerzo&&reforzadas.length?`<div class="gn-refuerzo"><b>REFORZADA · información de mando</b><br>${reforzadas.map(f=>esc(nom(f)+" "+f.slice(8)+": "+conteos[f]+" voluntarios · +"+(conteos[f]-4))).join(" · ")}</div>`:""}
    <div id="giAviso" style="min-height:20px;font-size:13.5px;color:#c92b2b;"></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;justify-content:space-between;">
      <span style="font-size:14px;"><b>${n?"Elegiste "+n+(n===1?" noche":" noches")+":":"Aún no eliges noches"}</b> ${esc(sel.map(f=>nom(f)+" "+f.slice(8)).join(" · "))}<br><small style="opacity:.7;">Mínimo: 2 noches${conf&&!conf.cumple?" · confirmaste "+conf.noches+": te falta 1 o justifica":""}</small></span>
      <button type="button" class="btn" id="giConfirmar">Confirmar mis noches</button></div>
    <p style="margin:10px 0 0;font-size:13px;"><a href="#" id="giJustificar" style="color:inherit;text-decoration:underline;">No puedo cumplir: justificar por correo</a></p></div>`;
  box.querySelectorAll("[data-gi]").forEach(b=>b.onclick=()=>{ const f=b.dataset.gi; GN_INS_SEL.has(f)?GN_INS_SEL.delete(f):GN_INS_SEL.add(f); renderGnInscripcionCard(false); });
  document.getElementById("giConfirmar").onclick=()=>gnInsConfirmar(p,who);
  document.getElementById("giJustificar").onclick=e=>{ e.preventDefault(); gnInsJustificar(p,who); };
}
async function gnInsGuardar(p,who,noches,justificacion){
  const ok1=await sSet("guardia-inscripcion:"+p.inicio+":"+who,noches);
  const ok2=await sSet("guardia-confirmacion:"+p.inicio+":"+who,{confirmadaEn:new Date().toISOString(),noches:noches.length,cumple:noches.length>=2,justificacion:justificacion||null});
  if(!ok1||!ok2) throw new Error("No se pudo guardar. Inténtalo de nuevo.");
  GN_INS_CACHE=null;
}
function gnInsAviso(t){ const a=document.getElementById("giAviso"); if(a) a.textContent=t||""; }
function gnInsToast(t){ const x=document.createElement("div"); x.id="giToast"; x.style.cssText="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:100001;background:#116b2e;color:#fff;border-radius:10px;padding:10px 16px;font-weight:700;font-size:14px;max-width:92vw;text-align:center;"; x.textContent=t; document.body.appendChild(x); setTimeout(()=>x.remove(),10000); }
async function gnInsConfirmar(p,who){
  const sel=[...GN_INS_SEL].sort(), n=sel.length, nom=iso=>new Date(iso+"T12:00").toLocaleDateString("es-CL",{weekday:"short"}).replace(".","")+" "+iso.slice(8);
  if(!n){ gnInsAviso("Elige al menos 2 noches, o justifica por correo."); return; }
  if(n<2){ gnInsAviso("El mínimo es 2 noches. Agrega otra noche o usa la justificación por correo."); return; }
  const confirmar=async(just)=>{ try{ await gnInsGuardar(p,who,sel,just); cerrarModalOdd(); gnInsToast("Noches confirmadas: "+sel.map(nom).join(" · ")); await renderGnInscripcionCard(true); }catch(e){ cerrarModalOdd(); gnInsAviso((e&&e.message)||"No se pudo guardar."); } };
  const c=modalOdd(`<h2 style="margin:0 0 8px;">¿Estás seguro?</h2><p>Vas a confirmar estas noches de guardia:</p><p style="font-size:17px;"><b>${esc(sel.map(nom).join(" · "))}</b></p><p style="color:#9aa0a8;font-size:14px;">Después no podrás cambiarlas desde aquí: los cambios se piden al Teniente Tercero.</p><div style="display:flex;gap:8px;margin-top:12px;"><button type="button" class="btn" id="giSi">Sí, confirmar</button><button type="button" class="btn secondary" id="giVolver">Volver</button></div>`);
  const q=id=>c.querySelector("#"+id);
  q("giSi").onclick=()=>confirmar(null); q("giVolver").onclick=cerrarModalOdd;
}
async function gnInsJustificar(p,who){
  const m=ROSTER.find(x=>String(x.id)===String(who)); const sel=[...GN_INS_SEL].sort();
  const asunto="Justificación guardia nocturna · semana del "+gnFmt(p.inicio), cuerpo="Voluntario: "+(m?nombreCompleto(m):who)+"\nSemana de guardia: "+gnFmt(p.inicio)+" → "+gnFmt(gnAdd(p.inicio,7))+"\nNoches elegidas: "+(sel.join(", ")||"ninguna")+"\n\nMotivo (salud, trabajo u otro):\n";
  try{ await gnInsGuardar(p,who,sel,{enviadaEn:new Date().toISOString(),estado:"por revisar"}); }catch(e){ gnInsAviso((e&&e.message)||"No se pudo guardar."); return; }
  window.open("mailto:germaniacbv@gmail.com?subject="+encodeURIComponent(asunto)+"&body="+encodeURIComponent(cuerpo),"_self");
  gnInsToast("Justificación registrada. Escribe el motivo en el correo y envíalo."); await renderGnInscripcionCard(true);
}
on("miVoluntario","change",()=>renderGnInscripcionCard(true));
setInterval(()=>{ renderGnInscripcionCard(false).catch(()=>{}); },60000);

/* ============ PRECEDENCIA DEL MANDO OPERATIVO ============
   Orden de precedencia vigente según la última ODD (hoy la ODD 037/2026). Se guarda aparte, con su ODD de origen y las versiones
   anteriores, y NO la borra «Restaurar pruebas» (es dato de referencia, no de prueba). Sirve para sugerir OBAC y el mando en la B-5. */
const PRECEDENCIA_KEY="precedencia:v1";
const PRECEDENCIA_ODD_037={odd:{numero:"037/2026",fecha:"2026-05-18",titulo:"Orden de precedencia del mando operativo de la Compañía",dejaSinEfecto:["006/2026 (17 de enero de 2026)"],firmas:["Francisco Vega Lara · Ayudante","Fernando Jerez Pantoja · Capitán"]},vigenteDesde:"2026-05-18",
  lista:[["Capitán","Fernando Jerez Pantoja"],["Teniente Primero","Tomás Lara Jeffs"],["Teniente Segundo","Matías Corvalán Garrido"],["Teniente Tercero","Andrés Herrera Santander"],["Voluntario","Pablo Arellano Graell"],["Voluntario","Ludwig von Plessing Cea"],["Voluntario","Gustavo Jerez Pantoja"],["Ayudante","Francisco Vega Lara"],["Jefe de Máquinas","Diego Lozano González"],["Tesorero General","Fernando Ortega Gutiérrez"],["Voluntario","Cristóbal Rascheya Travini"],["Director","Karam Puali López"],["Secretario","Susumu Sugiura Aguilar"],["Tesorero","Mathias Von Leyser Jux"],["Voluntario","Luis Bustos Rivera"],["Voluntario","Rodolfo Maldonado Avendaño"],["Voluntario","Manuel Moller Henríquez"],["Voluntario","Natalia Yáñez Navarrete"],["Voluntario","José Álvarez Álvarez"],["Voluntario","María Paz Solo de Zaldivar Lavanchy"],["Voluntario","María Paz Ortega González"],["Voluntario","Joaquín Bustos Guzmán"],["Voluntario","León Campino del Villar"],["Voluntario","Cesar Ilarre Castro"],["Voluntario","Christian Vergara Sandoval"],["Voluntario","Juan Pablo Orlandini Retamal"],["Voluntario","Vaslav Rubeska Becerra"],["Voluntario","Magdalena Cortés García"]]};
const PREC_CARGOS=["Capitán","Teniente Primero","Teniente Segundo","Teniente Tercero","Ayudante","Jefe de Máquinas","Tesorero General","Tesorero","Director","Secretario","Voluntario","Voluntaria","Secretaria","Cadete","Aspirante"];
const precN=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
const precTokens=t=>precN(t).split(" ").filter(x=>x.length>1&&!["de","del","la","las","los","y"].includes(x));
function precBuscar(nombre){
  const a=precTokens(nombre); if(!a.length) return null;
  return ROSTER.find(m=>{ const b=precTokens([m.nombre,m.apellidoPaterno,m.apellidoMaterno].filter(Boolean).join(" ")); if(!b.length) return false; const [c,l]=a.length<=b.length?[a,b]:[b,a]; return c.every(x=>l.includes(x)); })||null;
}
/* Lectura estricta: solo devuelve «null» si el servidor respondió que NO existe (un fallo de red nunca cuenta como «no existe») */
async function precLeerEstricto(){ const r=await fetch("/api/state/"+encodeURIComponent(PRECEDENCIA_KEY)); if(!r.ok) throw new Error("lectura"); const j=await r.json(); return j&&j.value!==undefined?j.value:null; }
async function sembrarPrecedencia(){
  try{
    if(await precLeerEstricto()) return;
    const b=PRECEDENCIA_ODD_037;
    await rawSet(PRECEDENCIA_KEY,{odd:b.odd,vigenteDesde:b.vigenteDesde,lista:b.lista.map(([cargo,nombre],i)=>({n:i+1,cargo,nombre})),historial:[],version:1,guardadaEn:new Date().toISOString()});
  }catch(e){ /* sin conexión: no se siembra nada */ }
}
function precParseTexto(t){
  const re=new RegExp("^\\s*(\\d{1,3})[.)]?\\s+("+PREC_CARGOS.slice().sort((a,b)=>b.length-a.length).join("|")+")\\s+(.+?)\\s*$","i"), out=[];
  String(t||"").split(/\r?\n/).forEach(l=>{ const m=re.exec(l); if(m){ const c=PREC_CARGOS.find(x=>x.toLowerCase()===m[2].toLowerCase())||m[2]; out.push({n:Number(m[1]),cargo:c,nombre:m[3].replace(/[.\s]+$/,"")}); } });
  return out;
}
function precRevisar(lista){
  const av=[]; if(lista.length<4) av.push("Se reconocieron muy pocas filas ("+lista.length+"). Revisa que el texto traiga N.º, cargo y nombre.");
  lista.forEach((x,i)=>{ if(x.n!==i+1) av.push("La numeración se corta en la fila "+(i+1)+" (dice "+x.n+")."); });
  const vistos=new Set(); lista.forEach(x=>{ const k=precN(x.nombre); if(vistos.has(k)) av.push("«"+x.nombre+"» aparece dos veces."); vistos.add(k); });
  return av;
}
async function renderPrecedencia(){
  const body=document.getElementById("precBody"); if(!body) return;
  let d=null; try{ d=await sGet(PRECEDENCIA_KEY,null); }catch(e){}
  const hay=d&&Array.isArray(d.lista)&&d.lista.length;
  document.getElementById("precFuente").innerHTML=hay?`Según la <b>ODD ${esc(d.odd.numero)}</b> (${esc(fmtDateLong(d.odd.fecha))}), firmada por ${esc((d.odd.firmas||[]).join(" y "))}.${(d.odd.dejaSinEfecto||[]).length?" Deja sin efecto la ODD "+esc(d.odd.dejaSinEfecto.join(", "))+".":""} Versión ${d.version||1}${(d.historial||[]).length?" · "+d.historial.length+" anterior(es) guardada(s)":""}.`:"Todavía no hay una precedencia guardada.";
  if(!hay){ body.innerHTML=""; document.getElementById("precNota").textContent=""; return; }
  let sin=0;
  body.innerHTML=d.lista.map(x=>{ const m=precBuscar(x.nombre); if(!m) sin++; return `<tr><td>${x.n}</td><td>${esc(x.cargo)}</td><td>${esc(x.nombre)}${m?"":' <small style="opacity:.65;">· sin ficha en la nómina</small>'}</td></tr>`; }).join("");
  document.getElementById("precNota").textContent=(d.lista.length-sin)+" de "+d.lista.length+" figuran en la nómina."+(sin?" Los que no figuran se muestran igual: revisa su nombre en la nómina.":"");
}
let PREC_NUEVA=null;
on("precAnalizarBtn","click",()=>{
  const lista=precParseTexto(document.getElementById("precTexto").value), av=precRevisar(lista), v=document.getElementById("precVista"), g=document.getElementById("precGuardarBtn");
  PREC_NUEVA=lista.length>=4&&!av.length?lista:null;
  v.innerHTML=`<p style="margin:8px 0;"><b>${lista.length} fila(s) reconocida(s).</b></p>${av.length?`<ul style="color:#c92b2b;margin:0 0 8px 18px;">${av.map(a=>`<li>${esc(a)}</li>`).join("")}</ul>`:'<p style="color:#116b2e;margin:0 0 8px;">La lista está completa y ordenada. Completa el N.º y la fecha de la ODD y guárdala.</p>'}`;
  g.style.display=PREC_NUEVA?"inline-block":"none";
});
on("precGuardarBtn","click",async()=>{
  const msg=document.getElementById("precMsg"); msg.style.color="#c92b2b"; msg.textContent="";
  try{
    const num=document.getElementById("precNumero").value.trim(), fecha=document.getElementById("precFecha").value;
    if(!PREC_NUEVA) throw new Error("Primero presiona «Revisar» con la tabla de la ODD.");
    if(!/^\d{1,3}\/\d{4}$/.test(num)) throw new Error("Escribe el número de la ODD con este formato: 037/2026.");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) throw new Error("Indica la fecha de la ODD.");
    const id=document.getElementById("miVoluntario")?.value, yo=ROSTER.find(x=>String(x.id)===String(id));
    if(!yo||!puedeAdministrar(yo)) throw new Error("Solo el Ayudante, el Secretario, el Capitán o el administrador pueden actualizar la precedencia. Elige tu nombre en la pantalla principal.");
    if(!MODO_PRUEBA_ABIERTO){ const r=await autenticarOficialidad(String(document.getElementById("precClave").value||"").trim()); if(!r.ok) throw new Error(mensajeOficialidad(r.motivo)); }
    const previo=await precLeerEstricto(); if(!previo) throw new Error("No se pudo leer la precedencia vigente. Inténtalo de nuevo.");
    const nuevo={odd:{numero:num,fecha,titulo:"Orden de precedencia del mando operativo",dejaSinEfecto:previo.odd?[previo.odd.numero]:[],firmas:[]},vigenteDesde:fecha,lista:PREC_NUEVA.map((x,i)=>({n:i+1,cargo:x.cargo,nombre:x.nombre})),
      historial:[{odd:previo.odd,vigenteDesde:previo.vigenteDesde,lista:previo.lista,reemplazadaEn:new Date().toISOString(),version:previo.version||1}].concat(previo.historial||[]),version:(previo.version||1)+1,guardadaEn:new Date().toISOString(),registradaPor:yo.id};
    if(!(await rawSet(PRECEDENCIA_KEY,nuevo))) throw new Error("No se pudo guardar. Inténtalo de nuevo.");
    PREC_NUEVA=null; document.getElementById("precGuardarBtn").style.display="none"; document.getElementById("precVista").innerHTML="";
    msg.style.color="#116b2e"; msg.textContent="Precedencia actualizada con la ODD "+num+". La anterior quedó guardada."; await renderPrecedencia();
  }catch(e){ msg.textContent=(e&&e.message)||"No se pudo guardar."; }
});
async function renderGnVoluntario(){
 const box=document.getElementById("gnVolSemana"); if(!box)return;
 const planes=await gnPlanes(); const hoy=todayISO(); const p=planes.filter(x=>x.estado==="abierta"&&x.fin>=hoy).sort((a,b)=>a.inicio.localeCompare(b.inicio))[0];
 if(!p){box.innerHTML='<div class="empty">No hay una semana con inscripción abierta.</div>';return;}
 const who=document.getElementById("miVoluntario")?.value; const saved=who?await sGet("guardia-inscripcion:"+p.inicio+":"+who,[]):[]; gnVolSel=new Set(saved);
 box.dataset.inicio=p.inicio;
 box.innerHTML=gnWeek(p.inicio).map((d,i)=>`<button type="button" class="gn-vol-day available ${gnVolSel.has(d)?"selected":""}" data-gn-vol="${d}"><b>${gnFmt(d)}</b><br><small>23:00–08:00</small>${i===4&&p.domingoDiurno?`<br><small>+ Diurna · ${p.lugarDomingo==="cuartel"?"Cuartel":"Domicilio"}</small>`:""}</button>`).join("");
 box.querySelectorAll("[data-gn-vol]").forEach(b=>b.onclick=()=>{const d=b.dataset.gnVol;gnVolSel.has(d)?gnVolSel.delete(d):gnVolSel.add(d);b.classList.toggle("selected",gnVolSel.has(d));});
}
on("gnVolLimpiar","click",()=>{gnVolSel.clear();document.querySelectorAll("[data-gn-vol]").forEach(x=>x.classList.remove("selected"));});
on("gnVolConfirmar","click",async()=>{
 const msg=document.getElementById("gnVolMsg"),who=document.getElementById("miVoluntario")?.value,ini=document.getElementById("gnVolSemana")?.dataset.inicio;
 if(!who){msg.textContent="Selecciona tu nombre primero.";return;} if(!ini){msg.textContent="No hay inscripción abierta.";return;} if(gnVolSel.size<2){msg.textContent="Debes seleccionar al menos 2 noches.";return;}
 await sSet("guardia-inscripcion:"+ini+":"+who,[...gnVolSel].sort()); msg.textContent="Disponibilidad guardada en GERMANIA."; 
});

/* Coordinación semanal por funciones: una sola semana central, sin duplicar la Guardia. */
function gnRolSemanalKey(rol,inicio){ return "guardia-rol:"+rol+":"+inicio; }
function gnEsMaquinista(m){
  const t=precN([m?.cargo,m?.rol,m?.especialidad].filter(Boolean).join(" "));
  return t.includes("maquin")||t.includes("conductor")||t.includes("jefe de maquinas");
}
function gnEsOficial(m){
  const t=precN(m?.cargo||"");
  return t.includes("capitan")||t.includes("teniente primero")||t.includes("teniente segundo")||t.includes("teniente tercero")||t.includes("teniente 1")||t.includes("teniente 2")||t.includes("teniente 3");
}
async function gnGuardarRolSemanal(rol,p,who,noches,extra={}){
  const key=gnRolSemanalKey(rol,p.inicio), actual=await sGet(key,{inicio:p.inicio,fin:p.fin,rol,personas:{},historial:[]});
  const previo=actual.personas?.[who]||null, ahora=new Date().toISOString();
  actual.personas=actual.personas||{};
  actual.historial=actual.historial||[];
  if(previo) actual.historial.push({id:who,previo,cambiadoEn:ahora});
  actual.personas[who]={id:who,noches:[...new Set(noches)].sort(),actualizadoEn:ahora,...extra};
  actual.actualizadoEn=ahora;
  if(actual.historial.length>300) actual.historial=actual.historial.slice(-300);
  return await sSet(key,actual);
}
async function gnConflictosSemana(p,who,noches,rol){
  const roles=["maquinista","oficial","obac"], conflictos=[];
  for(const r of roles){
    if(r===rol) continue;
    const d=await sGet(gnRolSemanalKey(r,p.inicio),null), asign=d?.personas?.[who]?.noches||[];
    noches.forEach(n=>{ if(asign.includes(n)) conflictos.push({noche:n,rol:r}); });
  }
  // Las funciones operativas se comparan por fecha; el cargo institucional no cambia.
  const vol=await sGet("guardia-inscripcion:"+p.inicio+":"+who,[]);
  if(rol!=="voluntario"&&Array.isArray(vol)) noches.forEach(n=>{ if(vol.includes(n)) conflictos.push({noche:n,rol:"voluntario"}); });
  return conflictos;
}
async function gnTransferirDesdeVoluntario(p,who,noches){
  const key="guardia-inscripcion:"+p.inicio+":"+who, vol=await sGet(key,[]);
  if(!Array.isArray(vol)) return;
  const queda=vol.filter(n=>!noches.includes(n));
  if(queda.length!==vol.length) await sSet(key,queda);
}
let GN_ROL_SEL=new Set(), GN_ROL_ACTIVO="", GN_ROL_PLAN=null;
async function renderGnRolSemanal(){
  const box=document.getElementById("gnRolesSemana"), who=document.getElementById("miVoluntario")?.value;
  if(!box||!who){ if(box) box.style.display="none"; return; }
  const yo=ROSTER.find(x=>String(x.id)===String(who)), planes=await gnPlanes(), hoy=todayISO();
  const p=planes.filter(x=>x.estado==="abierta"&&x.fin>=hoy).sort((a,b)=>a.inicio.localeCompare(b.inicio))[0];
  const esOficial=gnEsOficial(yo), esConductor=gnEsMaquinista(yo);
  const selector=document.getElementById("gnRolSelector"), wrap=document.getElementById("gnRolSelectorWrap");
  if(wrap) wrap.style.display=esOficial&&esConductor?"block":"none";
  let rol=esOficial&&esConductor?(selector?.value||"oficial"):esOficial?"oficial":esConductor?"maquinista":"";
  if(!p||!rol){ box.style.display="none"; return; }
  GN_ROL_PLAN=p; GN_ROL_ACTIVO=rol;
  const d=await sGet(gnRolSemanalKey(rol,p.inicio),null), saved=d?.personas?.[who]?.noches||[];
  GN_ROL_SEL=new Set(saved); box.style.display="block";
  document.getElementById("gnRolTitulo").textContent=rol==="maquinista"?"Guardia · Maquinistas":"Guardia · Oficiales";
  document.getElementById("gnRolSub").textContent=rol==="maquinista"?"Selecciona los días que puedes cubrir como conductor/maquinista.":"Selecciona los días que puedes cubrir como oficial.";
  const dias=gnWeek(p.inicio), out=document.getElementById("gnRolDias");
  out.innerHTML=dias.map(f=>'<button type="button" class="gn-vol-day available '+(GN_ROL_SEL.has(f)?"selected":"")+'" data-gn-rol="'+f+'"><b>'+esc(gnFmt(f))+'</b><br><small>23:00–08:00</small></button>').join("");
  out.querySelectorAll("[data-gn-rol]").forEach(b=>b.onclick=()=>{ const f=b.dataset.gnRol; GN_ROL_SEL.has(f)?GN_ROL_SEL.delete(f):GN_ROL_SEL.add(f); b.classList.toggle("selected",GN_ROL_SEL.has(f)); });
}
on("gnRolSelector","change",()=>renderGnRolSemanal().catch(()=>{}));
on("gnRolLimpiar","click",()=>{ GN_ROL_SEL.clear(); document.querySelectorAll("[data-gn-rol]").forEach(x=>x.classList.remove("selected")); });
on("gnRolGuardar","click",async()=>{
  const msg=document.getElementById("gnRolMsg"), who=document.getElementById("miVoluntario")?.value;
  if(!GN_ROL_PLAN||!GN_ROL_ACTIVO||!who) return;
  const noches=[...GN_ROL_SEL].sort();
  if(!noches.length){ msg.textContent="Selecciona al menos una noche para asignar la función."; return; }
  if(noches.some(n=>!/^\d{4}-\d{2}-\d{2}$/.test(n)||n<GN_ROL_PLAN.inicio||n>GN_ROL_PLAN.fin)){
    msg.textContent="Hay fechas fuera de la semana de guardia. Actualiza la planificación."; return;
  }
  const conflictos=await gnConflictosSemana(GN_ROL_PLAN,who,noches,GN_ROL_ACTIVO);
  if(conflictos.some(x=>x.rol!=="voluntario")){ msg.textContent="No puedes figurar como conductor y oficial/OBAC la misma noche. Corrige la selección."; return; }
  // Volver a verificar antes de escribir: la disponibilidad puede cambiar durante la edición.
  const conflictosActuales=await gnConflictosSemana(GN_ROL_PLAN,who,noches,GN_ROL_ACTIVO);
  if(conflictosActuales.some(x=>x.rol!=="voluntario")){ msg.textContent="La asignación cambió mientras editabas. Actualiza y vuelve a intentarlo."; return; }
  try {
    // Nunca retirar la inscripción de voluntario antes de confirmar el guardado del rol.
    await gnGuardarRolSemanal(GN_ROL_ACTIVO,GN_ROL_PLAN,who,noches);
    try {
      await gnTransferirDesdeVoluntario(GN_ROL_PLAN,who,noches);
    } catch (transferError) {
      // El rol se guardó; no afirmar éxito total si la baja del rol anterior falló.
      console.error("Guardia: transferencia parcial",transferError);
      msg.textContent="La función se guardó, pero falta conciliar las noches de voluntario. Solicita revisión al administrador.";
      GN_INS_CACHE=null;
      return;
    }
    msg.textContent="Días guardados en la semana central de Guardia."; GN_INS_CACHE=null;
  } catch (error) {
    console.error("No se pudo guardar la función de Guardia",error);
    msg.textContent="No se completó la asignación. Comprueba permisos y conexión; la inscripción original no se elimina antes de guardar el rol.";
  }
});
on("miVoluntario","change",()=>renderGnRolSemanal().catch(()=>{}));
/* OBAC semanal: convocatoria privada y secuencial según precedencia vigente. */
const GN_OBAC_META_PREFIX="guardia-obac-meta:";
async function gnObacMeta(p){
  return await sGet(GN_OBAC_META_PREFIX+p.inicio,{inicio:p.inicio,objetivo:6,decisiones:{},actualizadoEn:null});
}
async function gnObacGuardarMeta(p,d){
  d.actualizadoEn=new Date().toISOString();
  return await sSet(GN_OBAC_META_PREFIX+p.inicio,d);
}
async function gnObacCandidatos(){
  const prec=await sGet(PRECEDENCIA_KEY,null);
  return (prec?.lista||[]).map(x=>({ref:x,m:precBuscar(x.nombre)})).filter(x=>x.m);
}
async function gnObacSiguiente(p,meta){
  const candidatos=await gnObacCandidatos(), decisiones=meta.decisiones||{};
  const confirmados=Object.values(decisiones).filter(d=>d.estado==="confirmado").length;
  if(confirmados>=Number(meta.objetivo||6)) return null;
  for(const x of candidatos){
    const id=String(x.m.id), d=decisiones[id];
    if(!d||d.estado==="pendiente") return x;
  }
  return null;
}
async function renderGnObac(){
  const box=document.getElementById("gnObacTurno"), who=document.getElementById("miVoluntario")?.value;
  if(!box||!who){ if(box) box.style.display="none"; return; }
  const planes=await gnPlanes(), ahora=Date.now();
  const p=planes.filter(x=>x.estado==="abierta"&&x.confirmado!==false&&ahora<gnInsCierreMs(x)).sort((a,b)=>a.inicio.localeCompare(b.inicio))[0];
  if(!p){ box.style.display="none"; return; }
  const meta=await gnObacMeta(p), next=await gnObacSiguiente(p,meta);
  if(!next||String(next.m.id)!==String(who)){ box.style.display="none"; return; }
  box.style.display="block"; box.dataset.inicio=p.inicio;
  const rol=await sGet(gnRolSemanalKey("obac",p.inicio),null), saved=rol?.personas?.[who]?.noches||[];
  const sel=new Set(saved), out=document.getElementById("gnObacDias");
  out.innerHTML=gnWeek(p.inicio).map(f=>'<button type="button" class="gn-vol-day available '+(sel.has(f)?"selected":"")+'" data-gn-obac="'+f+'"><b>'+esc(gnFmt(f))+'</b><br><small>23:00–08:00</small></button>').join("");
  out.querySelectorAll("[data-gn-obac]").forEach(b=>b.onclick=()=>{ const f=b.dataset.gnObac; sel.has(f)?sel.delete(f):sel.add(f); b.classList.toggle("selected",sel.has(f)); });
  box._gnObac={p,who,sel,meta};
}
on("gnObacNo","click",async()=>{
  const box=document.getElementById("gnObacTurno"), x=box?._gnObac; if(!x) return;
  x.meta.decisiones=x.meta.decisiones||{}; x.meta.decisiones[x.who]={estado:"no_puede",respondidoEn:new Date().toISOString()};
  await gnObacGuardarMeta(x.p,x.meta);
  document.getElementById("gnObacMsg").textContent="Registrado: no puedes cumplir como OBAC. Sigues disponible para inscribirte como voluntario.";
  setTimeout(()=>renderGnObac().catch(()=>{}),400);
});
on("gnObacSi","click",async()=>{
  const box=document.getElementById("gnObacTurno"), x=box?._gnObac; if(!x) return;
  const noches=[...x.sel].sort(), msg=document.getElementById("gnObacMsg");
  if(!noches.length){ msg.textContent="Selecciona al menos una noche en que puedas cumplir como OBAC."; return; }
  const conflictos=await gnConflictosSemana(x.p,x.who,noches,"obac");
  if(conflictos.some(y=>y.rol!=="voluntario")){ msg.textContent="Hay un cruce con otra función esa noche. Elige otra noche."; return; }
  await gnTransferirDesdeVoluntario(x.p,x.who,noches);
  await gnGuardarRolSemanal("obac",x.p,x.who,noches,{fuente:"precedencia",estado:"confirmado"});
  x.meta.decisiones=x.meta.decisiones||{}; x.meta.decisiones[x.who]={estado:"confirmado",noches,respondidoEn:new Date().toISOString()};
  await gnObacGuardarMeta(x.p,x.meta); GN_INS_CACHE=null;
  msg.textContent="OBAC confirmado y guardado en la semana central.";
  setTimeout(()=>renderGnObac().catch(()=>{}),400);
});
on("miVoluntario","change",()=>renderGnObac().catch(()=>{}));
async function renderGnMandoResumen(){
  const box=document.getElementById("gnMandoResumen"), who=document.getElementById("miVoluntario")?.value;
  if(!box||!who){ if(box) box.style.display="none"; return; }
  const yo=ROSTER.find(x=>String(x.id)===String(who)), cargo=precN(yo?.cargo||"");
  const mando=cargo.includes("capitan")||cargo.includes("teniente tercero")||cargo.includes("teniente 3");
  if(!mando){ box.style.display="none"; return; }
  const planes=await gnPlanes(), hoy=todayISO();
  const p=planes.filter(x=>x.estado==="abierta"&&x.fin>=hoy).sort((a,b)=>a.inicio.localeCompare(b.inicio))[0];
  if(!p){ box.style.display="none"; return; }
  const [conteos,maq,ofi,obac,meta]=await Promise.all([
    gnConteosSemana(p),
    sGet(gnRolSemanalKey("maquinista",p.inicio),null),
    sGet(gnRolSemanalKey("oficial",p.inicio),null),
    sGet(gnRolSemanalKey("obac",p.inicio),null),
    gnObacMeta(p)
  ]);
  const porNoche=(doc,f)=>Object.values(doc?.personas||{}).filter(x=>(x.noches||[]).includes(f)).length;
  const decisiones=Object.values(meta.decisiones||{}), confirmados=decisiones.filter(x=>x.estado==="confirmado").length;
  const rechazados=decisiones.filter(x=>x.estado==="no_puede").length, objetivo=Number(meta.objetivo||6);
  const dias=gnWeek(p.inicio);
  const filas=dias.map(f=>{
    const v=conteos[f]||0, extra=Math.max(0,v-4);
    return '<div class="gn-vol-day" style="min-width:0"><b>'+esc(gnFmt(f))+'</b><br><small>'+v+' voluntarios'+(extra?' · REFORZADA +'+extra:'')+'<br>'+porNoche(maq,f)+' MAQ · '+porNoche(ofi,f)+' oficial · '+porNoche(obac,f)+' OBAC</small></div>';
  }).join("");
  box.style.display="block";
  document.getElementById("gnMandoResumenBody").innerHTML='<div class="gn-refuerzo"><b>OBAC por precedencia: '+confirmados+' / '+objetivo+'</b> · faltan '+Math.max(0,objetivo-confirmados)+' · no pueden '+rechazados+'</div><div class="gn-vol-week">'+filas+'</div><p class="sub" style="margin-top:10px">Este resumen se reconstruye desde la información central de la semana y queda disponible para la revisión previa de la ODD.</p><div class="gn-actions"><button type="button" class="btn" id="gnGuardarRevision">Guardar revisión para ODD</button></div>';
  const btn=document.getElementById("gnGuardarRevision");
  if(btn) btn.onclick=async()=>{ const msg=document.getElementById("gnMandoMsg"); btn.disabled=true; try{ const s=await gnGuardarRevisionSemanal(p); msg.textContent="Revisión ODD guardada · versión "+s.version+" · "+new Date(s.generadoEn).toLocaleString("es-CL"); }catch(e){ msg.textContent="No se pudo guardar la revisión ODD."; } finally{ btn.disabled=false; } };
}
on("miVoluntario","change",()=>renderGnMandoResumen().catch(()=>{}));
/* ============ GUARDIA NOCTURNA ============ */
const GUARDIA_IDX="guardias:index";

async function idxGuardias(){ return await sGet(GUARDIA_IDX,[]); }
async function getGuardia(c){ return await sGet("guardia:"+c,null); }
async function setGuardia(c,d){
  await sSet("guardia:"+c,d);
  const idx=await idxGuardias();
  if(!idx.find(i=>i.clave===c)){ idx.push({clave:c,fecha:d.fechaIng}); await sSet(GUARDIA_IDX,idx); }
}
function claveGuardia(f,h){ return f+"__"+(h||"").replace(":",""); }
/* Dataset temporal de validación del Dashboard.
   Fuente: programación de Guardia enero 2026 aportada por la Compañía.
   NO acredita asistencia efectiva. Se identifica para poder retirarlo íntegramente. */
const GUARDIA_PRUEBA_ENE26="guardia:test:enero2026:v1";
function idPorClaveGuardia(clave){ return ROSTER.find(p=>String(p.clave||"")===String(clave))?.id||""; }
async function sembrarGuardiaPruebaEnero2026(){
  if(await sGet(GUARDIA_PRUEBA_ENE26,false)) return;
  const rid=k=>idPorClaveGuardia(k);
  const guard=(clave,estado="cuartel",extra={})=>({id:rid(clave),estado,motivo:"",correo:false,obs:"",reemplazo:"",reemplazoRegistradoEn:"",...extra});
  const g=(fecha,oficial,conductor,guardianes,fuente="programación histórica")=>({
    fechaIng:fecha,horaIng:"23:00",fechaSal:(()=>{const d=new Date(fecha+"T12:00:00");d.setDate(d.getDate()+1);return d.toISOString().slice(0,10);})(),horaSal:"07:00",
    oficial:rid(oficial),conductor:rid(conductor),guardianes:guardianes.filter(x=>x.id),
    novedades:"REGISTRO TEMPORAL DE PRUEBA · "+fuente+" · eliminar al iniciar operación definitiva.",
    esPrueba:true,fuentePrueba:"Prueba integral Guardia Nocturna enero 2026"
  });
  const cambioEn="2026-01-10T18:30:00.000Z";
  const turnos=[
    // Caso 1: dotación normal completa.
    g("2026-01-07","45","9",[guard("515"),guard("516"),guard("523"),guard("524")],"turno de prueba autorizado para completar las 7 noches"),
    // Caso 2: voluntario desde su domicilio; conserva participación efectiva.
    g("2026-01-08","503","505",[guard("520","casa",{obs:"Acude al llamado desde su domicilio."}),guard("521"),guard("516"),guard("525")],"prueba de modalidad cuartel/domicilio"),
    // Caso 3: dotación superior al mínimo.
    g("2026-01-09","45","9",[guard("507"),guard("515"),guard("516"),guard("523"),guard("524")],"programación histórica · prueba de noche con más de cuatro guardianes"),
    // Caso 4: cambio de voluntario. Manuel Moller cede; Christian Vergara realiza el reemplazo.
    g("2026-01-10","45","505",[
      guard("515"),
      guard("522","no",{motivo:"Trabajo",correo:true,obs:"Cambio de voluntario simulado para prueba integral.",reemplazo:rid("517"),reemplazoRegistradoEn:cambioEn}),
      guard("523"),guard("504")
    ],"prueba de inasistencia justificada y reemplazo"),
    // Caso 5: falta de un guardián respecto del mínimo para comprobar alerta de cobertura.
    g("2026-01-11","503","9",[guard("513"),guard("524"),guard("504")],"prueba de dotación incompleta"),
    // Caso 6: cuatro guardianes y conductor/OBAC completos.
    g("2026-01-12","503","45",[guard("75"),guard("508"),guard("516"),guard("522")],"programación histórica"),
    // Caso 7: participación repetida para estadísticas acumuladas.
    g("2026-01-13","510","505",[guard("506"),guard("513"),guard("516"),guard("504")],"programación histórica · prueba acumulada")
  ];
  for(const turno of turnos){
    const clave=claveGuardia(turno.fechaIng,turno.horaIng);
    if(!(await getGuardia(clave))) await setGuardia(clave,turno);
  }
  await sSet(GUARDIA_PRUEBA_ENE26,{
    creadoEn:new Date().toISOString(),turnos:turnos.length,temporal:true,
    alcance:["OBAC","Conductor/Maquinista","Guardianes","Cuartel","Domicilio","Inasistencia justificada","Reemplazo","Dotación incompleta","Dotación sobre mínimo","Estadística acumulada"],
    cambioPrueba:{fecha:"2026-01-10",designado:"Manuel Moller Henriquez",reemplazo:"Christian Vergara Sandoval",motivo:"Trabajo"}
  });
}


const GUARDIA_MATRIZ_PRUEBA="guardia:test:matriz:v1";
async function sembrarMatrizGuardiaPrueba(){
  if(await sGet(GUARDIA_MATRIZ_PRUEBA,false)) return;
  const rid=k=>idPorClaveGuardia(k);
  const q=(k,estado="cuartel",extra={})=>({id:rid(k),estado,motivo:"",correo:false,obs:"",reemplazo:"",reemplazoRegistradoEn:"",...extra});
  const mk=(fecha,obac,conductor,guardianes,caso)=>({fechaIng:fecha,horaIng:"23:00",fechaSal:(()=>{const d=new Date(fecha+"T12:00:00");d.setDate(d.getDate()+1);return d.toISOString().slice(0,10);})(),horaSal:"07:00",oficial:obac?rid(obac):"",conductor:conductor?rid(conductor):"",guardianes:guardianes.filter(x=>x.id),novedades:"MATRIZ TEMPORAL DE PRUEBA · "+caso,esPrueba:true,fuentePrueba:"Matriz completa Guardia Nocturna"});
  const t=[
    mk("2026-02-04","45","9",[q("515"),q("516"),q("523"),q("524")],"mínimo completo"),
    mk("2026-02-05","503","505",[q("520","casa"),q("521"),q("516"),q("525"),q("507")],"domicilio y sobredotación"),
    mk("2026-02-06","45","9",[q("515"),q("522","no",{motivo:"Enfermedad",correo:true}),q("523"),q("504")],"inasistencia sin reemplazo"),
    mk("2026-02-07","45","505",[q("515"),q("522","no",{motivo:"Trabajo",correo:true,reemplazo:rid("517"),reemplazoRegistradoEn:"2026-02-07T18:00:00.000Z"}),q("523"),q("504")],"inasistencia con reemplazo"),
    mk("2026-02-08","503","",[q("513"),q("524"),q("504"),q("516")],"sin conductor"),
    mk("2026-02-09","","9",[q("75"),q("508"),q("516"),q("522")],"sin OBAC"),
    mk("2026-02-10","510","505",[q("506"),q("513"),q("516")],"dotación bajo mínimo"),
    mk("2026-02-11","45","9",[q("517"),q("515"),q("516"),q("523"),q("524"),q("504")],"seis guardianes"),
    mk("2026-02-12","503","505",[q("517"),q("520"),q("521"),q("525")],"reemplazante vuelve como titular"),
    mk("2026-02-13","45","9",[q("515","no",{motivo:"Viaje",correo:true,reemplazo:rid("517"),reemplazoRegistradoEn:"2026-02-13T17:00:00.000Z"}),q("516"),q("523"),q("524")],"segundo reemplazo acumulado"),
    mk("2026-02-14","503","505",[q("513","casa"),q("504","casa"),q("516"),q("522")],"dos desde domicilio"),
    mk("2026-02-15","45","9",[q("515"),q("516"),q("523"),q("524")],"repetición para acumulados")
  ];
  for(const x of t){const k=claveGuardia(x.fechaIng,x.horaIng);if(!(await getGuardia(k)))await setGuardia(k,x);}
  await sSet(GUARDIA_MATRIZ_PRUEBA,{creadoEn:new Date().toISOString(),temporal:true,turnos:t.length,casos:["mínimo","sobredotación","domicilio","inasistencia sin reemplazo","inasistencia con reemplazo","sin conductor","sin OBAC","bajo mínimo","reemplazos acumulados","participación repetida"]});
}
async function validarMatrizGuardiaPrueba(){
  const errores=[], activos=ROSTER.filter(x=>x.activo!==false);
  const stats=await guardiasEnRangoPanel("2026-02-04","2026-02-15",activos);
  if(stats.turnos!==12) errores.push("Matriz: se esperaban 12 turnos y hay "+stats.turnos);
  if(stats.incompletas!==2) errores.push("Matriz: se esperaban 2 noches bajo mínimo y hay "+stats.incompletas);
  if(stats.cedidas!==2) errores.push("Matriz: se esperaban 2 guardias cedidas y hay "+stats.cedidas);
  const christian=stats.por[idPorClaveGuardia("517")], moller=stats.por[idPorClaveGuardia("522")];
  if(!christian||christian.reemplazos!==2) errores.push("Matriz: Christian debe registrar 2 reemplazos");
  if(!moller||moller.cedidas<1) errores.push("Matriz: Moller debe registrar al menos 1 cedida");
  const sinConductor=await getGuardia(claveGuardia("2026-02-08","23:00"));
  const sinObac=await getGuardia(claveGuardia("2026-02-09","23:00"));
  if(!sinConductor||sinConductor.conductor) errores.push("Matriz: caso sin conductor inválido");
  if(!sinObac||sinObac.oficial) errores.push("Matriz: caso sin OBAC inválido");
  const resultado={ok:errores.length===0,fecha:new Date().toISOString(),turnos:stats.turnos,participacionesEfectivas:stats.realizadas,participantes:stats.participantes,cedidas:stats.cedidas,sobreMinimo:stats.sobreMinimo,nochesBajoMinimo:stats.incompletas,errores};
  await rawSet("guardia:test:matriz:validacion:v1",resultado);
  return resultado;
}

async function validarGuardiaPruebaEnero2026(){
  const errores=[], esperadas=["2026-01-07","2026-01-08","2026-01-09","2026-01-10","2026-01-11","2026-01-12","2026-01-13"];
  const idx=await idxGuardias();
  const leidas=[];
  for(const fecha of esperadas){
    const clave=claveGuardia(fecha,"23:00");
    if(!idx.some(x=>x.clave===clave)){errores.push("Índice sin "+fecha);continue;}
    const g=await getGuardia(clave);
    if(!g){errores.push("Registro sin "+fecha);continue;}
    leidas.push(g);
    if(g.fechaIng!==fecha||g.horaIng!=="23:00"||g.horaSal!=="07:00") errores.push("Horario inválido "+fecha);
  }
  const cambio=leidas.find(g=>g.fechaIng==="2026-01-10");
  if(cambio){
    const moller=idPorClaveGuardia("522"), christian=idPorClaveGuardia("517");
    const m=normalizaTurno(cambio.guardianes).find(x=>x.id===moller);
    if(!m||m.estado!=="no"||m.reemplazo!==christian||m.motivo!=="Trabajo"||!m.reemplazoRegistradoEn) errores.push("Reemplazo Moller → Vergara incompleto");
  }
  const activos=ROSTER.filter(x=>x.activo!==false);
  const stats=await guardiasEnRangoPanel("2026-01-07","2026-01-13",activos);
  const moller=idPorClaveGuardia("522"), christian=idPorClaveGuardia("517");
  if(stats.turnos!==7) errores.push("Turnos esperados 7, obtenidos "+stats.turnos);
  if(!stats.por[moller]||stats.por[moller].cedidas<1) errores.push("Moller no registra guardia cedida");
  if(stats.por[moller]&&stats.por[moller].propias>1) errores.push("Moller recibió crédito por noche cedida");
  if(!stats.por[christian]||stats.por[christian].reemplazos<1||stats.por[christian].total<1) errores.push("Vergara no recibió crédito por reemplazo");
  const resultado={ok:errores.length===0,fecha:new Date().toISOString(),turnos:stats.turnos,realizadas:stats.realizadas,cedidas:stats.cedidas,sobreMinimo:stats.sobreMinimo,incompletas:stats.incompletas,participantes:stats.participantes,errores};
  await rawSet("guardia:test:enero2026:validacion:v1",resultado);
  return resultado;
}

function renderGnOficial(){
  const sel=document.getElementById("gnOficial"); if(!sel) return;
  const prev=sel.value;
  sel.innerHTML='<option value="">— seleccionar —</option>'+
    sortedRoster(false).map(p=>{
      const a=acronimoCargo(p);
      return `<option value="${p.id}">${a?"["+esc(a)+"] ":""}${esc(nombreCompleto(p))}</option>`;
    }).join("");
  if(prev) sel.value=prev;
  const con=document.getElementById("gnConductor");
  if(con){
    const cp=con.value;
    con.innerHTML=sel.innerHTML;
    if(cp) con.value=cp;
  }
}
const GN_ESTADOS=[
  ["cuartel","Presente en el cuartel"],
  ["casa","Desde su casa, acude al llamado"],
  ["no","No asiste"]
];
const GN_MOTIVOS=["Enfermedad","Licencia médica","Viaje","Otra actividad","Trabajo","Otro"];

/* Guardianes del turno, en memoria mientras se edita la ficha */
let gnTurno=[];   // {id, estado, motivo, correo, obs, reemplazo}

function normalizaTurno(lista){
  return (lista||[]).map(x=> typeof x==="string"
    ? {id:x, estado:"cuartel", motivo:"", correo:false, obs:"", reemplazo:"", reemplazoRegistradoEn:""}
    : {id:x.id, estado:x.estado||"cuartel", motivo:x.motivo||"", correo:!!x.correo,
       obs:x.obs||"", reemplazo:x.reemplazo||"", reemplazoRegistradoEn:x.reemplazoRegistradoEn||""});
}
function opcionesVoluntarios(excluir,vacio){
  const ex=new Set(excluir||[]);
  return `<option value="">${vacio||"— sin asignar —"}</option>`+
    sortedRoster(false).filter(p=>!ex.has(p.id))
      .map(p=>`<option value="${p.id}">${p.clave?"("+esc(p.clave)+") ":""}${esc(nombreCompleto(p))}</option>`).join("");
}
function renderGnAgregar(){
  const sel=document.getElementById("gnAgregar"); if(!sel) return;
  sel.innerHTML=opcionesVoluntarios(gnTurno.map(g=>g.id),"— seleccionar voluntario —");
}
function renderGnGuardianes(lista){
  if(lista!==undefined) gnTurno=normalizaTurno(lista);
  const box=document.getElementById("gnGuardianes"); if(!box) return;
  if(!gnTurno.length){
    box.innerHTML='<div class="empty">Aún no se han agregado guardianes a esta guardia.</div>';
    renderGnAgregar(); contarGuardianes(); return;
  }
  box.innerHTML=gnTurno.map((g,i)=>{
    const m=ROSTER.find(x=>x.id===g.id);
    const noAsiste = g.estado==="no";
    return `<div class="card" style="padding:13px 14px;margin-bottom:10px;background:var(--panel-2);">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:9px;">
        <div class="name-col" style="font-size:14px;">
          ${m&&m.clave?`<span class="clv">${esc(m.clave)}</span> `:""}${esc(m?nombreCompleto(m):"—")}
        </div>
        <button class="del-btn" data-quitar="${i}" title="Quitar de la guardia">🗑</button>
      </div>
      <div class="field-row" style="margin-bottom:${noAsiste?"10px":"0"};">
        <div class="field" style="flex:1 1 200px;">
          <label>Situación</label>
          <select data-campo="estado" data-i="${i}">
            ${GN_ESTADOS.map(([v,t])=>`<option value="${v}" ${g.estado===v?"selected":""}>${t}</option>`).join("")}
          </select>
        </div>
      </div>
      ${noAsiste?`
      <div class="field-row" style="margin-bottom:10px;">
        <div class="field" style="flex:1 1 170px;">
          <label>Motivo de la inasistencia</label>
          <select data-campo="motivo" data-i="${i}">
            <option value="">— indicar —</option>
            ${GN_MOTIVOS.map(v=>`<option value="${v}" ${g.motivo===v?"selected":""}>${v}</option>`).join("")}
          </select>
        </div>
        <div class="field" style="flex:1 1 200px;">
          <label>Reemplazado por</label>
          <select data-campo="reemplazo" data-i="${i}">${opcionesVoluntarios(gnTurno.map(x=>x.id),"— sin reemplazo —")}</select>
          ${g.reemplazoRegistradoEn?`<small style="color:var(--muted);">Cambio registrado: ${new Date(g.reemplazoRegistradoEn).toLocaleString("es-CL")}</small>`:""}
        </div>
      </div>
      <div class="field-row" style="margin-bottom:0;">
        <div class="field" style="flex:1 1 100%;">
          <label>Observación</label>
          <input type="text" data-campo="obs" data-i="${i}" value="${esc(g.obs)}" placeholder="Detalle de la justificación">
        </div>
      </div>
      <label style="display:flex;align-items:center;gap:9px;margin-top:9px;font-size:13px;cursor:pointer;">
        <input type="checkbox" data-campo="correo" data-i="${i}" ${g.correo?"checked":""}
               style="width:17px;height:17px;accent-color:var(--ok);">
        Justificó por correo a la Compañía
      </label>`:""}
    </div>`;
  }).join("");

  box.querySelectorAll("[data-campo]").forEach(el=>{
    el.addEventListener("change",()=>{
      const i=+el.dataset.i, c=el.dataset.campo;
      const anterior=gnTurno[i][c];
      gnTurno[i][c] = (c==="correo") ? el.checked : el.value;
      if(c==="reemplazo" && anterior!==el.value) gnTurno[i].reemplazoRegistradoEn=el.value?new Date().toISOString():"";
      if(c==="estado"){
        if(el.value!=="no"){ gnTurno[i].reemplazo=""; gnTurno[i].reemplazoRegistradoEn=""; }
        renderGnGuardianes();
      } else contarGuardianes();
    });
    if(el.dataset.campo==="obs") el.addEventListener("input",()=>{ gnTurno[+el.dataset.i].obs=el.value; });
  });
  box.querySelectorAll("[data-quitar]").forEach(b=>b.addEventListener("click",()=>{
    gnTurno.splice(+b.dataset.quitar,1); renderGnGuardianes();
  }));
  // Los reemplazos se muestran una vez pintado el selector
  gnTurno.forEach((g,i)=>{
    const s=box.querySelector(`select[data-campo="reemplazo"][data-i="${i}"]`);
    if(s && g.reemplazo) s.value=g.reemplazo;
  });
  renderGnAgregar(); contarGuardianes();
}
on("gnAgregarBtn","click",()=>{
  const sel=document.getElementById("gnAgregar");
  if(!sel.value) return;
  gnTurno.push({id:sel.value,estado:"cuartel",motivo:"",correo:false,obs:"",reemplazo:"",reemplazoRegistradoEn:""});
  renderGnGuardianes();
});

/* Quienes efectivamente cubren la guardia: los presentes más los reemplazantes */
function cubrenGuardia(lista){
  const t=normalizaTurno(lista);
  const ids=[];
  t.forEach(g=>{
    if(g.estado!=="no") ids.push(g.id);
    else if(g.reemplazo) ids.push(g.reemplazo);
  });
  return ids;
}
function contarGuardianes(){
  const cubren=cubrenGuardia(gnTurno).length;
  const faltan=gnTurno.filter(g=>g.estado==="no" && !g.reemplazo).length;
  const msg=document.getElementById("gnMsg");
  if(msg && !msg.classList.contains("err")){
    msg.textContent = gnTurno.length
      ? `${gnTurno.length} designado${gnTurno.length===1?"":"s"} · ${cubren} cubre${cubren===1?"":"n"} la guardia`
        + (faltan?` · ${faltan} sin reemplazo`:"")
      : "";
  }
}

async function cargarGuardia(){
  const f=document.getElementById("gnFechaIng").value, h=document.getElementById("gnHoraIng").value;
  if(!f) return;
  const ex=await getGuardia(claveGuardia(f,h));
  const msg=document.getElementById("gnMsg"); msg.classList.remove("err");
  if(ex){
    document.getElementById("gnFechaSal").value=ex.fechaSal||"";
    document.getElementById("gnHoraSal").value=ex.horaSal||"";
    document.getElementById("gnNovedades").value=ex.novedades||"";
    renderGnOficial();
    document.getElementById("gnOficial").value=ex.oficial||""; const gc=document.getElementById("gnConductor"); if(gc) gc.value=ex.conductor||"";
    renderGnGuardianes(ex.guardianes||[]);
    msg.textContent="Ya existe una guardia registrada para esta fecha y hora. Puedes editarla.";
  } else {
    document.getElementById("gnNovedades").value="";
    renderGnOficial(); renderGnGuardianes([]);
  }
}
on("gnFechaIng","change",()=>{
  const f=document.getElementById("gnFechaIng").value;
  const s=document.getElementById("gnFechaSal");
  if(f && !s.value){ const d=new Date(f+"T12:00"); d.setDate(d.getDate()+1);
    s.value=d.toISOString().slice(0,10); }
  cargarGuardia();
});
on("gnHoraIng","change",cargarGuardia);

on("gnGuardarBtn","click",async()=>{
  const msg=document.getElementById("gnMsg");
  const f=document.getElementById("gnFechaIng").value;
  const g=gnTurno;
  if(!f){ msg.textContent="Indica la fecha de ingreso de la guardia."; msg.classList.add("err"); return; }
  if(!g.length){ msg.textContent="Agrega al menos un guardián designado."; msg.classList.add("err"); return; }
  const d={
    fechaIng:f, horaIng:document.getElementById("gnHoraIng").value,
    fechaSal:document.getElementById("gnFechaSal").value, horaSal:document.getElementById("gnHoraSal").value,
    oficial:document.getElementById("gnOficial").value,
    conductor:document.getElementById("gnConductor")?.value||"",
    guardianes:gnTurno, novedades:document.getElementById("gnNovedades").value.trim()
  };
  await setGuardia(claveGuardia(f,d.horaIng),d);
  msg.classList.remove("err");
  msg.textContent=`Guardia registrada: ${g.length} designado${g.length===1?"":"s"}, ${cubrenGuardia(g).length} cubren el turno.`;
  renderGnLista();
});

function nombrePorId(id){ const m=ROSTER.find(x=>x.id===id); return m?nombreCompleto(m):"—"; }

function gnDocumento(reg){
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"FICHA DE GUARDIA NOCTURNA");
  doc.setFontSize(10);
  doc.text(`Ingreso: ${fmtDateLong(reg.fechaIng)} a las ${reg.horaIng||"—"}`,14,36);
  doc.text(`Salida:  ${reg.fechaSal?fmtDateLong(reg.fechaSal):"—"} a las ${reg.horaSal||"—"}`,14,42);
  doc.text(`OBAC / Oficial a cargo: ${reg.oficial?nombrePorId(reg.oficial):"—"}`,14,48);
  doc.text(`Conductor / Maquinista: ${reg.conductor?nombrePorId(reg.conductor):"—"}`,14,54);
  const t=normalizaTurno(reg.guardianes);
  const est={cuartel:"En el cuartel",casa:"Desde su casa",no:"No asiste"};
  doc.autoTable({startY:60,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["N°","Clave","Guardián designado","Situación","Motivo","Reemplazado por","Cambio registrado","Justif. correo"]],
    body:t.map(g=>{
      const m=ROSTER.find(x=>x.id===g.id);
      return [m?m.n||"":"", m?m.clave||"—":"—", m?nombreCompleto(m):"—",
              est[g.estado]||"", g.estado==="no"?(g.motivo||"—"):"—",
              g.reemplazo?nombrePorId(g.reemplazo):"—",
              g.reemplazoRegistradoEn?new Date(g.reemplazoRegistradoEn).toLocaleString("es-CL"):"—",
              g.estado==="no"?(g.correo?"Sí":"No"):"—"];
    })});
  const cubren=cubrenGuardia(reg.guardianes);
  doc.setFont("helvetica","bold"); doc.setFontSize(9);
  doc.text(`Cubren la guardia: ${cubren.length} de ${t.length} designados`,14,doc.lastAutoTable.finalY+6);
  doc.setFont("helvetica","normal");
  const obs=t.filter(g=>g.estado==="no"&&g.obs);
  if(obs.length){
    doc.autoTable({startY:doc.lastAutoTable.finalY+10,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Justificaciones recibidas",""]],
      body:obs.map(g=>[nombrePorId(g.id),g.obs])});
  }
  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
    head:[["Novedades de la guardia"]],
    body:[[reg.novedades||"Sin novedad"]]});
  let fy=doc.lastAutoTable.finalY+22;
  if(fy>240){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Guardián responsable",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Oficial a cargo",115,fy+5);
  return doc;
}
on("gnPdfBtn","click",async()=>{
  const f=document.getElementById("gnFechaIng").value;
  const reg={fechaIng:f,horaIng:document.getElementById("gnHoraIng").value,
    fechaSal:document.getElementById("gnFechaSal").value,horaSal:document.getElementById("gnHoraSal").value,
    oficial:document.getElementById("gnOficial").value,conductor:document.getElementById("gnConductor")?.value||"",guardianes:gnTurno,
    novedades:document.getElementById("gnNovedades").value.trim()};
  if(!f||!reg.guardianes.length){ alert("Completa la fecha y agrega los guardianes antes de generar el PDF."); return; }
  await sharePdfDoc(gnDocumento(reg),`guardia_${f}.pdf`,`Guardia nocturna del ${f}`);
});

function rangoGn(){
  return {d:document.getElementById("gnDesde").value, h:document.getElementById("gnHasta").value};
}
async function guardiasEnRango(){
  const {d,h}=rangoGn();
  const idx=await idxGuardias();
  const out=[];
  for(const it of idx){
    if(d && it.fecha<d) continue;
    if(h && it.fecha>h) continue;
    const g=await getGuardia(it.clave); if(g) out.push(g);
  }
  return out.sort((a,b)=>a.fechaIng<b.fechaIng?-1:1);
}
on("gnSemana","click",()=>{
  const hoy=new Date();
  const ini=new Date(hoy); ini.setDate(hoy.getDate()-6);
  document.getElementById("gnDesde").value=ini.toISOString().slice(0,10);
  document.getElementById("gnHasta").value=hoy.toISOString().slice(0,10);
  renderGnLista();
});
on("gnMes","click",()=>{
  const h=new Date();
  document.getElementById("gnDesde").value=new Date(h.getFullYear(),h.getMonth(),1).toISOString().slice(0,10);
  document.getElementById("gnHasta").value=new Date(h.getFullYear(),h.getMonth()+1,0).toISOString().slice(0,10);
  renderGnLista();
});
on("gnDesde","change",renderGnLista);
on("gnHasta","change",renderGnLista);

async function renderGnLista(){
  const lista=await guardiasEnRango();
  const box=document.getElementById("gnLista"), res=document.getElementById("gnResumen");
  const turnos=lista.length;
  const cubiertos=lista.reduce((s,g)=>s+cubrenGuardia(g.guardianes).length,0);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;
  let inasist=0, sinR=0;
  lista.forEach(g=>normalizaTurno(g.guardianes).forEach(x=>{
    if(x.estado==="no"){ inasist++; if(!x.reemplazo) sinR++; } }));
  res.innerHTML=`
    <div class="summary-item"><div class="big">${turnos}</div><div class="lbl">Guardias registradas</div></div>
    <div class="summary-item"><div class="big">${cubiertos}</div><div class="lbl">Turnos cubiertos</div></div>
    <div class="summary-item"><div class="big">${turnos?(cubiertos/turnos).toFixed(1):0}</div><div class="lbl">Guardianes por noche</div></div>
    <div class="summary-item"><div class="big">${inasist}</div><div class="lbl">Inasistencias</div></div>
    <div class="summary-item"><div class="big">${sinR}</div><div class="lbl">Sin reemplazo</div></div>
    <div class="summary-item"><div class="big">${conNov}</div><div class="lbl">Con novedad</div></div>`;
  if(!turnos){ box.innerHTML='<div class="empty">No hay guardias registradas en este período.</div>'; return; }
  box.innerHTML=lista.slice().reverse().map(g=>`
    <div class="hist-item">
      <div>
        <div class="hist-date">${fmtDateLong(g.fechaIng)} · ${esc(g.horaIng||"")} a ${esc(g.horaSal||"")}</div>
        <div class="hist-acto">${cubrenGuardia(g.guardianes).map(id=>esc(nombrePorId(id))).join(", ")}
          ${g.oficial?" · Oficial: "+esc(nombrePorId(g.oficial)):""}
          ${(()=>{const f=normalizaTurno(g.guardianes).filter(x=>x.estado==="no");
            return f.length?" · No asisten: "+f.map(x=>esc(nombrePorId(x.id))+(x.reemplazo?" (reemplazado)":" (sin reemplazo)")).join(", "):"";})()}
          ${g.novedades?" · "+esc(g.novedades):""}</div>
      </div>
      <div class="hist-right"><span class="badge">${cubrenGuardia(g.guardianes).length}</span></div>
    </div>`).join("");
}

on("gnPdfSemanal","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME DE GUARDIAS NOCTURNAS");
  doc.setFontSize(9);
  doc.text(`Período ${d||"inicio"} al ${h||"hoy"} · ${lista.length} guardias · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,33);
  doc.autoTable({startY:42,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    columnStyles:{3:{cellWidth:58}},
    head:[["Fecha","Horario","Oficial a cargo","Cubren la guardia","Inasistencias","Novedades"]],
    body:lista.map(g=>{
      const t=normalizaTurno(g.guardianes);
      const faltas=t.filter(x=>x.estado==="no").map(x=>
        nombrePorId(x.id)+" ("+(x.motivo||"sin motivo")+(x.correo?", justificó":"")+
        (x.reemplazo?"; reemplaza "+nombrePorId(x.reemplazo):"; sin reemplazo")+")");
      return [g.fechaIng,(g.horaIng||"")+" a "+(g.horaSal||""),
        g.oficial?nombrePorId(g.oficial):"—",
        cubrenGuardia(g.guardianes).map(id=>nombrePorId(id)).join(", "),
        faltas.length?faltas.join(" | "):"—",
        g.novedades||"Sin novedad"];
    })});
  let fy=doc.lastAutoTable.finalY+20;
  if(fy>240){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Ayudante",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Capitán",115,fy+5);
  await sharePdfDoc(doc,`guardias_${d||"inicio"}_a_${h||"hoy"}.pdf`,"Informe de guardias nocturnas");
});

on("gnPdfEstad","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const conteo={}, desig={}, falto={}, reemp={}, ofi={};
  sortedRoster(false).forEach(p=>{ conteo[p.id]=0; desig[p.id]=0; falto[p.id]=0; reemp[p.id]=0; });
  let inasist=0, justif=0, sinReemplazo=0, reemplazos=0;
  lista.forEach(g=>{
    const t=normalizaTurno(g.guardianes);
    t.forEach(x=>{
      if(desig[x.id]!==undefined) desig[x.id]++;
      if(x.estado==="no"){
        inasist++; if(x.correo) justif++;
        if(falto[x.id]!==undefined) falto[x.id]++;
        if(x.reemplazo){ reemplazos++; if(reemp[x.reemplazo]!==undefined) reemp[x.reemplazo]++; }
        else sinReemplazo++;
      }
    });
    cubrenGuardia(g.guardianes).forEach(id=>{ if(conteo[id]!==undefined) conteo[id]++; });
    if(g.oficial) ofi[g.oficial]=(ofi[g.oficial]||0)+1;
  });
  const total=lista.length;
  const cubiertos=lista.reduce((s,g)=>s+cubrenGuardia(g.guardianes).length,0);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME ESTADÍSTICO DE GUARDIAS");
  doc.setFontSize(9);
  doc.text(`Período ${d||"inicio"} al ${h||"hoy"} · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,33);
  doc.autoTable({startY:42,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]},
    head:[["Resumen",""]],
    body:[["Guardias registradas",String(total)],
          ["Turnos cubiertos",String(cubiertos)],
          ["Promedio de guardianes por noche",(cubiertos/total).toFixed(1)],
          ["Guardias con novedad",`${conNov} de ${total}`],
          ["Voluntarios que participaron",String(Object.values(conteo).filter(v=>v>0).length)],
          ["Inasistencias de designados",String(inasist)],
          ["De ellas, justificadas por correo",`${justif} de ${inasist}`],
          ["Cubiertas con reemplazo",`${reemplazos} de ${inasist}`],
          ["Turnos que quedaron sin reemplazo",String(sinReemplazo)]]});
  const filas=sortedRoster(false).map(p=>({p,n:conteo[p.id]||0,d:desig[p.id]||0,
    f:falto[p.id]||0,r:reemp[p.id]||0})).sort((a,b)=>b.n-a.n);
  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["N°","Clave","Voluntario","Designado","Cubrió","No asistió","Reemplazó","% cumplim."]],
    body:filas.map(x=>[x.p.n||"",x.p.clave||"—",nombreCompleto(x.p),String(x.d),String(x.n),
      String(x.f),String(x.r), x.d?((x.d-x.f)/x.d*100).toFixed(0)+"%":"—"])});
  const ofiFilas=Object.entries(ofi).sort((a,b)=>b[1]-a[1]);
  if(ofiFilas.length){
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
      head:[["Oficial a cargo","Guardias"]],
      body:ofiFilas.map(([id,n])=>[nombrePorId(id),String(n)])});
  }
  await sharePdfDoc(doc,`estadistica_guardias_${d||"inicio"}_a_${h||"hoy"}.pdf`,"Estadística de guardias nocturnas");
});

/* ---- INFOGRAFÍA DE GUARDIAS ---- */
on("gnInfo","click",async()=>{
  const lista=await guardiasEnRango(); const {d,h}=rangoGn();
  if(!lista.length){ alert("No hay guardias registradas en ese período."); return; }
  const DIAS=["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const f1=x=>x.toFixed(1);

  const conteo={}, desig={}, falto={}, reemp={};
  sortedRoster(false).forEach(p=>{ conteo[p.id]=0; desig[p.id]=0; falto[p.id]=0; reemp[p.id]=0; });
  let inasist=0, justif=0, sinR=0, reemplazos=0, cubiertos=0;
  lista.forEach(g=>{
    normalizaTurno(g.guardianes).forEach(x=>{
      if(desig[x.id]!==undefined) desig[x.id]++;
      if(x.estado==="no"){
        inasist++; if(x.correo) justif++;
        if(falto[x.id]!==undefined) falto[x.id]++;
        if(x.reemplazo){ reemplazos++; if(reemp[x.reemplazo]!==undefined) reemp[x.reemplazo]++; }
        else sinR++;
      }
    });
    const c=cubrenGuardia(g.guardianes); cubiertos+=c.length;
    c.forEach(id=>{ if(conteo[id]!==undefined) conteo[id]++; });
  });
  const ranking=sortedRoster(false).map(p=>({p,n:conteo[p.id]||0,d:desig[p.id]||0,
    f:falto[p.id]||0,r:reemp[p.id]||0})).filter(x=>x.d||x.n).sort((a,b)=>b.n-a.n);
  const conNov=lista.filter(g=>g.novedades && !/^sin novedad/i.test(g.novedades)).length;

  const noches=lista.map(g=>{
    const t=normalizaTurno(g.guardianes);
    const [yy,mm,dd]=g.fechaIng.split("-").map(Number);
    const dia=new Date(yy,mm-1,dd);
    return {g,t,dia,
      cuartel:t.filter(x=>x.estado==="cuartel"),
      casa:t.filter(x=>x.estado==="casa"),
      faltan:t.filter(x=>x.estado==="no")};
  });

  const doc=`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=1180">
<title>Guardias nocturnas · Quinta Compañía</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8edf3;font-family:'Source Sans 3',sans-serif;color:#1e293b;padding:18px}
.hoja{max-width:1120px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 18px rgba(0,0,0,.13)}
.top{background:linear-gradient(135deg,#0f2a4a,#1b4a82);color:#fff;padding:20px 26px;display:flex;align-items:center;gap:22px}
.top img{width:60px;height:66px;object-fit:contain}
.top h1{font-family:'Barlow Condensed',sans-serif;font-size:36px;line-height:1}
.top h2{font-size:14px;font-weight:600;opacity:.95;margin-top:2px}
.lema{font-family:'Barlow Condensed',sans-serif;font-size:11px;letter-spacing:3px;opacity:.75;margin-top:5px}
.corte{margin-left:auto;text-align:right;background:rgba(255,255,255,.12);border-radius:7px;padding:9px 14px;font-size:11.5px}
.corte b{display:block;font-size:14px;margin-top:2px}
.cuerpo{padding:16px}
.sec{border:1px solid #d3dceb;border-radius:8px;margin-bottom:13px;overflow:hidden}
.sec>h3{background:#0f2a4a;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:15.5px;letter-spacing:.6px;padding:8px 14px}
.sec>.in{padding:14px}
.kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}
.k{border-radius:8px;padding:12px;text-align:center;border:1px solid #dbe4f0;background:#f4f8fd}
.k .n{font-family:'Barlow Condensed',sans-serif;font-size:31px;line-height:1;color:#0f2a4a}
.k .t{font-size:10.8px;color:#5b6b82;margin-top:4px;font-weight:600}
.k.v{background:#eefbf2;border-color:#b9e6c8}.k.v .n{color:#16a34a}
.k.r{background:#fdeded;border-color:#f6c6c6}.k.r .n{color:#dc2626}
.noches{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}
.noche{border:1px solid #dbe4f0;border-radius:8px;overflow:hidden;background:#fbfcfe}
.noche .cab{background:#eaf0f8;padding:8px 11px;border-bottom:1px solid #dbe4f0}
.noche .cab b{display:block;font-family:'Barlow Condensed',sans-serif;font-size:16px;color:#0f2a4a;text-transform:capitalize}
.noche .cab span{font-size:11px;color:#64748b}
.noche .cnt{padding:10px 11px}
.g{display:flex;align-items:center;gap:7px;font-size:12px;padding:3px 0}
.g em{font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;flex:0 0 auto}
.e-c{background:#dcf2e3;color:#15683a}
.e-h{background:#e3ecfb;color:#1b4a82}
.e-r{background:#fdf0dc;color:#96601a}
.e-n{background:#fbe0e0;color:#8f1d1d;text-decoration:none}
.g s{text-decoration:line-through;opacity:.65}
.ofi{font-size:11px;color:#475569;border-top:1px dashed #dbe4f0;margin-top:8px;padding-top:7px}
.nov{font-size:11px;color:#8f1d1d;background:#fdf4f3;border-radius:5px;padding:6px 8px;margin-top:7px;line-height:1.4}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#eaf0f8;color:#0f2a4a;text-align:left;padding:6px 8px;border:1px solid #d3dceb;font-weight:700}
td{padding:5px 8px;border:1px solid #e3e9f2}
.leyenda{display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:#475569;margin-top:12px}
.leyenda span{display:flex;align-items:center;gap:6px}
.pie{background:#0f2a4a;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.5}
.pie .lm{font-family:'Barlow Condensed',sans-serif;letter-spacing:2.5px;opacity:.8}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none}}
</style></head><body><div class="hoja">
<div class="top"><img src="${LOGO_B64}" alt="">
<div><h1>GUARDIAS NOCTURNAS</h1>
<h2>Quinta Compañía "Germania" — Cuerpo de Bomberos de Villarrica</h2>
<div class="lema">DISCIPLINA &nbsp;•&nbsp; SERVICIO &nbsp;•&nbsp; COMPAÑERISMO</div></div>
<div class="corte">Período<b>${esc(d||"inicio")} al ${esc(h||"hoy")}</b></div></div>
<div class="cuerpo">

<div class="sec"><h3>RESUMEN DEL PERÍODO</h3><div class="in"><div class="kpis">
<div class="k"><div class="n">${lista.length}</div><div class="t">Noches con guardia</div></div>
<div class="k v"><div class="n">${cubiertos}</div><div class="t">Turnos cubiertos</div></div>
<div class="k"><div class="n">${f1(cubiertos/lista.length)}</div><div class="t">Guardianes por noche</div></div>
<div class="k"><div class="n">${inasist}</div><div class="t">Inasistencias</div></div>
<div class="k ${sinR?"r":"v"}"><div class="n">${sinR}</div><div class="t">Sin reemplazo</div></div>
<div class="k"><div class="n">${conNov}</div><div class="t">Noches con novedad</div></div>
</div></div></div>

<div class="sec"><h3>NÓMINA NOCHE POR NOCHE</h3><div class="in">
<div class="noches">
${noches.map(n=>`
  <div class="noche">
    <div class="cab">
      <b>${DIAS[n.dia.getDay()]} ${n.dia.getDate()}</b>
      <span>${esc(n.g.horaIng||"")} a ${esc(n.g.horaSal||"")} · ${esc(n.g.fechaIng)}</span>
    </div>
    <div class="cnt">
      ${n.cuartel.map(x=>`<div class="g"><em class="e-c">CUARTEL</em>${esc(nombrePorId(x.id))}</div>`).join("")}
      ${n.casa.map(x=>`<div class="g"><em class="e-h">A LLAMADO</em>${esc(nombrePorId(x.id))}</div>`).join("")}
      ${n.faltan.map(x=>`
        <div class="g"><em class="e-n">NO ASISTE</em><s>${esc(nombrePorId(x.id))}</s></div>
        <div class="g" style="padding-left:14px;font-size:11px;color:#64748b;">${esc(x.motivo||"sin motivo")}${x.correo?" · justificó por correo":""}</div>
        ${x.reemplazo?`<div class="g"><em class="e-r">REEMPLAZA</em>${esc(nombrePorId(x.reemplazo))}</div>`:
          `<div class="g" style="padding-left:14px;font-size:11px;color:#8f1d1d;">Sin reemplazo</div>`}`).join("")}
      <div class="ofi">Oficial a cargo: <b>${n.g.oficial?esc(nombrePorId(n.g.oficial)):"—"}</b></div>
      ${n.g.novedades && !/^sin novedad/i.test(n.g.novedades)?`<div class="nov"><b>Novedad:</b> ${esc(n.g.novedades)}</div>`:""}
    </div>
  </div>`).join("")}
</div>
<div class="leyenda">
  <span><em class="e-c" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">CUARTEL</em> duerme en el cuartel</span>
  <span><em class="e-h" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">A LLAMADO</em> acude desde su casa</span>
  <span><em class="e-r" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">REEMPLAZA</em> cubre a un designado</span>
  <span><em class="e-n" style="font-style:normal;font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;">NO ASISTE</em> designado que no concurre</span>
</div>
</div></div>

<div class="sec"><h3>PARTICIPACIÓN POR VOLUNTARIO</h3><div class="in">
<table><tr><th>N°</th><th>Voluntario</th><th>Designado</th><th>Cubrió</th><th>No asistió</th><th>Reemplazó</th><th>Cumplimiento</th></tr>
${ranking.map(x=>`<tr><td>${x.p.n||""}</td><td><b>${esc(nombreCompleto(x.p))}</b></td>
<td>${x.d}</td><td>${x.n}</td><td>${x.f}</td><td>${x.r}</td>
<td><b>${x.d?((x.d-x.f)/x.d*100).toFixed(0)+"%":"—"}</b></td></tr>`).join("")}
</table>
${inasist?`<div style="margin-top:12px;background:#fdf4f3;border:1px solid #f6c6c6;border-radius:7px;padding:10px 12px;font-size:11.5px;color:#8f1d1d;">
<b>Inasistencias:</b> ${inasist} en el período, de las cuales ${justif} se justificaron por correo y ${reemplazos} fueron cubiertas con reemplazo. ${sinR?`Quedaron ${sinR} turno${sinR===1?"":"s"} sin reemplazo.`:"Todas fueron reemplazadas."}</div>`:""}
</div></div>

</div>
<div class="pie"><div><b>Desarrollado por la 5ta Compañía "Germania"</b> · Cuerpo de Bomberos de Villarrica · Chile<br>
<span style="opacity:.72">Generado el ${new Date().toLocaleDateString("es-CL")}</span></div>
<div class="lm">VOLUNTAD HOY, COMUNIDAD SIEMPRE</div></div>
</div></body></html>`;

  const blob=new Blob([doc],{type:"text/html;charset=utf-8"});
  await entregarArchivo(blob,`guardias_${d||"inicio"}_a_${h||"hoy"}.html`,
    `Guardias nocturnas · ${d||"inicio"} al ${h||"hoy"}`,"Infografía de guardias generada");
});

/* ============ HISTORIAL ============ */
function populateTipoFilters(){
  ["histTipoFiltro"].forEach(id=>{
    const sel=document.getElementById(id); if(!sel) return;
    const cur=sel.value;
    sel.innerHTML='<option value="">Todos</option>'+TIPOS.map(t=>`<option value="${esc(t)}">${esc(t)}</option>`).join("");
    if(TIPOS.includes(cur)) sel.value=cur;
  });
}
/* Descripciones existentes, para poder filtrar por ellas */
async function poblarDescripciones(){
  const sel=document.getElementById("histDescFiltro"); if(!sel) return;
  const prev=sel.value;
  const idx=await getIndex(); const set=new Set();
  for(const it of idx){
    const p=await getParte(it.clave);
    if(p && p.detalle && p.detalle.trim()) set.add(p.detalle.trim());
  }
  const lista=[...set].sort((a,b)=>a.localeCompare(b,"es"));
  sel.innerHTML='<option value="">Todas</option>'+lista.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join("");
  if(lista.includes(prev)) sel.value=prev;
}

async function poblarAniosHistorial(idx){
  const sel=document.getElementById("histAnioFiltro"); if(!sel) return;
  const prev=sel.value;
  const anios=[...new Set(idx.map(i=>String(i.date||"").slice(0,4)).filter(Boolean))].sort((a,b)=>b-a);
  sel.innerHTML='<option value="">Todos</option>'+anios.map(a=>`<option value="${a}">${a}</option>`).join("");
  if(anios.includes(prev)) sel.value=prev;
}
async function renderHistorial(){
  const list=document.getElementById("historialList");
  const f=document.getElementById("histTipoFiltro").value;
  const anio=document.getElementById("histAnioFiltro") ? document.getElementById("histAnioFiltro").value : "";
  const fd=document.getElementById("histDescFiltro") ? document.getElementById("histDescFiltro").value : "";
  const txt=(document.getElementById("histBuscar") ? document.getElementById("histBuscar").value : "").trim().toLowerCase();
  await poblarDescripciones();
  let idx=(await getIndex()).slice().sort((a,b)=>a.date<b.date?1:-1);
  await poblarAniosHistorial(idx);
  if(f) idx=idx.filter(i=>i.tipo===f);
  if(anio) idx=idx.filter(i=>String(i.date||"").slice(0,4)===anio);

  const filtrados=[];
  for(const it of idx){
    const p=await getParte(it.clave); if(!p) continue;
    const det=(p.detalle||"").trim();
    if(fd && det!==fd) continue;
    if(txt && !((det+" "+(p.tipo||"")).toLowerCase().includes(txt))) continue;
    filtrados.push({it,p});
  }
  const res=document.getElementById("histResumen");
  if(res) res.textContent = filtrados.length
    ? `${filtrados.length} actividad${filtrados.length===1?"":"es"} encontrada${filtrados.length===1?"":"s"}`
    : "";
  if(!filtrados.length){ list.innerHTML='<div class="empty">No hay actividades que coincidan con el filtro.</div>'; return; }
  list.innerHTML="";
  for(const {it,p} of filtrados){
    const c=countStatuses(p.records);
    const div=document.createElement("div"); div.className="hist-item";
    div.innerHTML=`<div>
        <div class="hist-date">${fmtDateLong(p.date)} <span class="badge">${esc(p.tipo)}</span>${p.numero?` <span class="badge">N° ${String(p.numero).padStart(3,"0")}/${p.anio}</span>`:""}</div>
        <div class="hist-acto">${esc(p.detalle||"Sin detalle")}${p.registradoPor?" · Pasó lista: "+esc(p.registradoPor):""}</div>
      </div>
      <div class="hist-right">
        <div class="hist-count">${c.presente} pres. · ${c.justificado} just. · ${c.ausente} aus.</div>
        <button class="btn small secondary" data-open="${it.clave}">Editar</button>
        <button class="btn small gold" data-pdf="${it.clave}">PDF</button>
      </div>`;
    list.appendChild(div);
  }
  list.querySelectorAll("[data-open]").forEach(b=>b.addEventListener("click",async()=>{
    const p=await getParte(b.dataset.open); if(!p) return;
    document.getElementById("fecha").value=p.date;
    renderTipoSelect(); document.getElementById("tipoSelect").value=p.tipo;
    await loadListaForSelection();
    document.getElementById("registradoPor").value=p.registradoPor||"";
    switchTab("lista");
  }));
  list.querySelectorAll("[data-pdf]").forEach(b=>b.addEventListener("click",async()=>{
    const p=await getParte(b.dataset.pdf); if(!p) return;
    await sharePdfDoc(buildParteDoc(p.date,p.tipo,p.detalle||"",p.records,p.registradoPor||"",p.numero,p.anio),`parte_${p.date}_${slug(p.tipo)}.pdf`);
  }));
}
on("histTipoFiltro","change",renderHistorial);
on("histAnioFiltro","change",renderHistorial);
on("histDescFiltro","change",renderHistorial);
on("histBuscar","input",renderHistorial);
on("histLimpiar","click",()=>{
  ["histTipoFiltro","histAnioFiltro","histDescFiltro","histBuscar"].forEach(id=>{ const e=document.getElementById(id); if(e) e.value=""; });
  renderHistorial();
});

/* ============ PANEL DE ESTADISTICAS ============ */
const MESES_NOM=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
function pct(a,b){ return b? (a/b*100) : 0; }

/* Años presentes en los datos, para que la estadística siga creciendo con el tiempo */
async function aniosConDatos(){
  const idx=await getIndex();
  const set=new Set(idx.map(i=>i.date.slice(0,4)));
  try{ (await idxGuardias()).forEach(i=>{if(i.fecha)set.add(String(i.fecha).slice(0,4));}); }catch(e){ console.error("Dashboard: años de Guardia no disponibles",e); }
  set.add(String(new Date().getFullYear()));
  return [...set].sort().reverse();
}
async function poblarSelectoresPanel(){
  const selA=document.getElementById("pnAnio");
  // GERMANIA 2026: esta vista estadística usa exclusivamente registros del año 2026.
  selA.innerHTML='<option value="2026">2026</option>';
  selA.value="2026";
  selA.disabled=true;
  const selM=document.getElementById("pnMes");
  if(!selM.options.length){
    selM.innerHTML='<option value="anio">Anual · año completo</option>'
      + MESES_NOM.map((m,i)=>`<option value="${i+1}">Mensual · ${m}</option>`).join("");
    selM.value="anio";
  }
}

/* Rango de fechas segun el periodo elegido */
function rangoPanel(){
  // Regla de corte vigente: ningún registro fuera de 2026 entra en totales, porcentajes o detalle.
  const anio="2026";
  const modo=document.getElementById("pnMes").value || "anio";
  const hoy=todayISO();
  if(modo==="anio") return {desde:`${anio}-01-01`, hasta:`${anio}-12-31`, etiqueta:`Año ${anio} completo`, modo};
  if(modo==="acum"){
    const hasta = (hoy.slice(0,4)===anio) ? hoy : `${anio}-12-31`;
    return {desde:`${anio}-01-01`, hasta, etiqueta:`Acumulado al ${fmtDateLong(hasta)}`, modo};
  }
  const m=String(modo).padStart(2,"0");
  const fin=new Date(parseInt(anio,10), parseInt(modo,10), 0).getDate();
  return {desde:`${anio}-${m}-01`, hasta:`${anio}-${m}-${fin}`, etiqueta:`${MESES_NOM[modo-1]} de ${anio}`, modo:"mes"};
}

function miembroVigenteEnFecha(m,fecha){
  if(!m||!fecha) return false;
  const ingreso=m.fechaIngreso||FOUNDING_DATE;
  if(ingreso&&fecha<ingreso) return false;
  const baja=m.fechaBaja||m.fechaRetiro||"";
  if(baja&&fecha>baja) return false;
  // Una baja histórica sin fecha no permite reconstruir obligaciones pasadas con seguridad.
  // Se excluye del universo estadístico hasta que exista fecha de baja/reincorporación.
  if(m.activo===false&&!baja) return false;
  return true;
}
function firmaContenidoParteImportado(pt){
  if(!pt||!pt.importado) return "";
  const presentes=Object.entries(pt.records||{}).filter(([,v])=>v==="presente").map(([id])=>id).sort().join(",");
  return [pt.date||"",pt.tipo||"",pt.detalle||"",presentes].join("|");
}
function firmaParteImportado(pt){
  if(!pt||!pt.importado) return "";
  // Solo se deduplican copias de la MISMA fila/origen de importación.
  // Dos llamados reales pueden coincidir en fecha, tipo, detalle e incluso asistentes.
  return pt.importId ? "id|"+String(pt.importId) : "";
}
const PANEL_CACHE_TTL_MS=5*60*1000;
const panelCache=new Map();
function invalidarCachePanel(){ panelCache.clear(); }
async function datosPanel(desde,hasta){
  const cacheKey=desde+"|"+hasta;
  const cached=panelCache.get(cacheKey);
  if(cached && (Date.now()-cached.ts)<PANEL_CACHE_TTL_MS) return cached.data;
  const idx=(await getIndex()).filter(i=>i.date>=desde && i.date<=hasta);
  const resultados=[];
  // Carga acotada: evita lanzar cientos de lecturas simultáneas contra Neon.
  const LOTE=8;
  for(let i=0;i<idx.length;i+=LOTE){
    const lote=idx.slice(i,i+LOTE);
    resultados.push(...await Promise.allSettled(lote.map(it=>getParte(it.clave))));
    if(i+LOTE<idx.length) await new Promise(resolve=>setTimeout(resolve,0));
  }
  const vistos=new Set(), partes=[];
  resultados.filter(x=>x.status==="fulfilled"&&x.value).forEach(x=>{
    const pt=x.value, firma=firmaParteImportado(pt);
    if(firma&&vistos.has(firma)) return;
    if(firma) vistos.add(firma);
    if(parteCuentaAsistencia(pt)) partes.push(pt);
  });
  const fallidos=resultados.filter(x=>x.status==="rejected").length;
  if(fallidos) console.error("Dashboard: partes no disponibles:",fallidos);
  partes.sort((a,b)=>a.date<b.date?-1:1);
  const activos=sortedRoster(false);
  const stats={};
  activos.forEach(p=>stats[p.id]={pres:0,just:0,aus:0,oblig:0});
  partes.forEach(pt=>{
    activos.forEach(m=>{
      if(!miembroVigenteEnFecha(m,pt.date)) return;
      if(!voluntarioAplicaParte(pt,m.id)) return;
      stats[m.id].oblig++;
      const s=(pt.records&&pt.records[m.id])||"ausente";
      if(s==="presente") stats[m.id].pres++;
      else if(s==="justificado") stats[m.id].just++;
      else stats[m.id].aus++;
    });
  });
  const data={partes, activos, stats};
  panelCache.set(cacheKey,{ts:Date.now(),data});
  return data;
}

/* Estadísticas separadas: concurrencia institucional y asistencia individual. */
function resumen(partes, activos, stats){
  const N=partes.length;
  const totPres=activos.reduce((s,m)=>s+stats[m.id].pres,0);
  const posibles=activos.reduce((s,m)=>s+stats[m.id].oblig,0);
  const tipos={};
  const meses={};
  partes.forEach(pt=>{
    const t=pt.tipo||"Sin tipo";
    if(!tipos[t]) tipos[t]={n:0,pres:0,posibles:0};
    tipos[t].n++;
    const mm=parseInt(pt.date.slice(5,7),10);
    if(!meses[mm]) meses[mm]={n:0,pres:0,posibles:0};
    meses[mm].n++;
    activos.forEach(m=>{
      if(!miembroVigenteEnFecha(m,pt.date)||!voluntarioAplicaParte(pt,m.id)) return;
      tipos[t].posibles++; meses[mm].posibles++;
      if((pt.records&&pt.records[m.id])==="presente"){ tipos[t].pres++; meses[mm].pres++; }
    });
  });
  const porPersona=activos.map(m=>{
    const oblig=stats[m.id].oblig;
    const porTipo={};
    partes.forEach(pt=>{
      if(!miembroVigenteEnFecha(m,pt.date)||!voluntarioAplicaParte(pt,m.id)) return;
      const t=pt.tipo||"Sin tipo";
      if(!porTipo[t]) porTipo[t]={total:0,pres:0,just:0,aus:0};
      porTipo[t].total++;
      const estado=(pt.records&&pt.records[m.id])||"ausente";
      if(estado==="presente") porTipo[t].pres++;
      else if(estado==="justificado") porTipo[t].just++;
      else porTipo[t].aus++;
    });
    Object.values(porTipo).forEach(d=>d.p=d.total?pct(d.pres,d.total):0);
    return {m,pres:stats[m.id].pres,oblig,p:oblig?pct(stats[m.id].pres,oblig):0,porTipo};
  }).sort((a,b)=>b.p-a.p);
  const orden=porPersona.filter(x=>x.oblig>0).map(x=>x.p).slice().sort((a,b)=>a-b);
  const mediana=orden.length ? (orden.length%2 ? orden[(orden.length-1)/2]
                : (orden[orden.length/2-1]+orden[orden.length/2])/2) : 0;
  const conv=partes.map(pt=>{
    const elegibles=activos.filter(m=>miembroVigenteEnFecha(m,pt.date)&&voluntarioAplicaParte(pt,m.id));
    const c=elegibles.filter(m=>(pt.records&&pt.records[m.id])==="presente").length;
    return {pt,c,elegibles:elegibles.length,t:pct(c,elegibles.length)};
  }).sort((a,b)=>b.c-a.c);
  return {N,totPres,posibles,global:pct(totPres,posibles),promedio:N?totPres/N:0,tipos,meses,porPersona,mediana,conv};
}

async function guardiasEnRangoPanel(desde,hasta,activos){
  const idx=await idxGuardias(), por={};
  activos.forEach(m=>por[m.id]={asignadas:0,propias:0,reemplazos:0,cedidas:0,ausenciasSinReemplazo:0,obac:0,conductor:0,total:0,cumplimiento:0,adicionales:0});
  let turnos=0, incompletas=0, sinObac=0, sinConductor=0, sobreDotacion=0;
  for(const it of idx){
    const fecha=it.fecha||""; if(fecha&&(fecha<desde||fecha>hasta))continue;
    const g=await getGuardia(it.clave); if(!g)continue;
    const fechaGuardia=g.fechaIng||fecha; if(!fechaGuardia||fechaGuardia<desde||fechaGuardia>hasta)continue;
    turnos++; const hechos=new Set(); let cobertura=0;
    normalizaTurno(g.guardianes).forEach(x=>{
      if(por[x.id]){por[x.id].asignadas++;if(x.estado!=="no"){por[x.id].propias++;hechos.add(x.id);cobertura++;}else if(x.reemplazo)por[x.id].cedidas++;else por[x.id].ausenciasSinReemplazo++;}
      if(x.estado==="no"&&x.reemplazo&&por[x.reemplazo]){por[x.reemplazo].reemplazos++;hechos.add(x.reemplazo);cobertura++;}
    });
    if(cobertura<4)incompletas++; if(cobertura>4)sobreDotacion++;
    if(g.oficial&&por[g.oficial]){por[g.oficial].obac++;hechos.add(g.oficial);}else sinObac++;
    if(g.conductor&&por[g.conductor]){por[g.conductor].conductor++;hechos.add(g.conductor);}else sinConductor++;
    hechos.forEach(id=>{if(por[id])por[id].total++;});
  }
  Object.values(por).forEach(x=>{x.cumplimiento=x.asignadas?pct(x.propias,x.asignadas):0;x.adicionales=x.reemplazos;});
  const v=Object.values(por),participantes=v.filter(x=>x.total>0).length,conAsignacion=v.filter(x=>x.asignadas>0);
  const asignadas=conAsignacion.reduce((s,x)=>s+x.asignadas,0),propias=conAsignacion.reduce((s,x)=>s+x.propias,0);
  return {turnos,por,incompletas,sinObac,sinConductor,sobreDotacion,realizadas:v.reduce((s,x)=>s+x.total,0),cedidas:v.reduce((s,x)=>s+x.cedidas,0),reemplazos:v.reduce((s,x)=>s+x.reemplazos,0),ausenciasSinReemplazo:v.reduce((s,x)=>s+x.ausenciasSinReemplazo,0),sobreMinimo:v.filter(x=>x.total>2).length,participantes,participacionRoster:pct(participantes,activos.length),cumplimientoTotal:asignadas?pct(propias,asignadas):0,cumplimientoCompleto:conAsignacion.filter(x=>x.propias===x.asignadas).length,conCedidas:v.filter(x=>x.cedidas>0).length,reemplazantes:v.filter(x=>x.reemplazos>0).length,sinParticipacion:v.filter(x=>x.total===0).length};
}
function categoriaAsistencia(pt){
  if(pt&&typeof pt==="object") return origenAsistencia(pt).categoria;
  return origenAsistencia({tipo:String(pt||"")}).categoria;
}
function resumenCategoriasVoluntario(partes,m){
  const cats={};
  partes.forEach(pt=>{
    if(!miembroVigenteEnFecha(m,pt.date)||!voluntarioAplicaParte(pt,m.id)) return;
    const cat=categoriaAsistencia(pt), estado=(pt.records&&pt.records[m.id])||"ausente";
    if(!cats[cat]) cats[cat]={total:0,pres:0,just:0,aus:0};
    const d=cats[cat]; d.total++;
    if(estado==="presente")d.pres++; else if(estado==="justificado")d.just++; else d.aus++;
  });
  return cats;
}

async function renderPanel(){
  // Estadística es bajo demanda: solo se ejecuta al entrar explícitamente a esta pestaña.
  const idsCarga=["pnKpis","pnTipos","pnTramos","pnMeses","pnDetalle","pnRanking","pnConvocatoria","pnHallazgos"];
  idsCarga.forEach(id=>{const el=document.getElementById(id);if(el)el.setAttribute("aria-busy","true");});
  const corteCarga=document.getElementById("pnCorte");
  if(corteCarga) corteCarga.textContent="Estamos cargando tu información…";
  try{ poblarSelectoresPanel().catch(e=>console.error("Selectores panel:",e)); }catch(e){ console.error("Selectores panel:",e); }
  const R=rangoPanel();
  let partes,activos,stats,r;
  try{
    ({partes,activos,stats}=await datosPanel(R.desde,R.hasta));
    r=resumen(partes,activos,stats);
  }catch(e){
    console.error("Dashboard: no fue posible cargar los datos principales.",e);
    const corte=document.getElementById("pnCorte");
    if(corte) corte.textContent=R.etiqueta+" · no fue posible cargar los datos";
    ["pnKpis","pnTipos","pnTramos","pnMeses","pnDetalle","pnRanking","pnConvocatoria","pnHallazgos"]
      .forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML='<div class="empty">No fue posible cargar esta información. Intenta actualizar nuevamente.</div>';});
    return;
  }
  // Guardia nunca bloquea el tablero. El núcleo se pinta primero y la participación
  // de Guardia se consulta después; si no hay registros o falla la consulta, permanece en 0.
  const guardiasPanel={turnos:0,por:{},realizadas:0,cedidas:0,sobreMinimo:0};
  idsCarga.forEach(id=>document.getElementById(id)?.removeAttribute("aria-busy"));
  if(corteCarga) corteCarga.textContent=R.etiqueta;
    guardiasEnRangoPanel(R.desde,R.hasta,activos).then(g=>{
    if(!g) return;
    const ids={turnos:"pnGuardiaTurnos",realizadas:"pnGuardiaRealizadas",sobreMinimo:"pnGuardiaSobreMinimo",cedidas:"pnGuardiaCedidas",participantes:"pnGuardiaParticipantes",reemplazos:"pnGuardiaReemplazos",cumplimientoCompleto:"pnGuardiaCumplen",conCedidas:"pnGuardiaConCedidas",reemplazantes:"pnGuardiaReemplazantes",sinParticipacion:"pnGuardiaSinParticipacion",incompletas:"pnGuardiaIncompletas",sinObac:"pnGuardiaSinObac",sinConductor:"pnGuardiaSinConductor"};
    Object.entries(ids).forEach(([k,id])=>{const el=document.getElementById(id);if(el)el.textContent=String(g[k]||0);});
    const cp=document.getElementById("pnGuardiaCumplimiento");if(cp)cp.textContent=g.cumplimientoTotal.toFixed(1)+"%";
    const pr=document.getElementById("pnGuardiaParticipacionRoster");if(pr)pr.textContent=g.participacionRoster.toFixed(1)+"%";
    const body=document.getElementById("pnGuardiaRankingBody");
    if(body){
      body.innerHTML=r.porPersona.slice().sort((a,b)=>(g.por[b.m.id]?.total||0)-(g.por[a.m.id]?.total||0)).map(x=>{
        const q=g.por[x.m.id]||{asignadas:0,propias:0,reemplazos:0,cedidas:0,total:0};
        return `<tr><td class="n-col">${x.m.n||""}</td><td class="name-col">${esc(nombreCompleto(x.m))}</td><td>${q.asignadas}</td><td>${q.propias}</td><td>${q.asignadas?q.cumplimiento.toFixed(1)+"%":"—"}</td><td>${q.reemplazos}</td><td>${q.cedidas}</td><td><b>${q.total}</b></td></tr>`;
      }).join("");
    }
  }).catch(e=>console.error("Dashboard Guardia:",e));
  const bajas=ROSTER.filter(m=>m.activo===false).length;

  document.getElementById("pnCorte").textContent = r.N
    ? `${R.etiqueta} · ${r.N} actividades · última el ${fmtDateLong(partes[partes.length-1].date)}`
    : `${R.etiqueta} · sin actividades registradas`;

  // El estado de importación es informativo y nunca debe bloquear el Dashboard.
  // Se actualiza en segundo plano después de disponer de los datos principales.
  Promise.allSettled([sGet(IMPORT_KEY,null),getIndex()]).then(([imp,idx])=>{
    const cajaImp=document.getElementById("pnImport");
    if(!cajaImp) return;
    if(imp.status==="fulfilled" && !imp.value){
      cajaImp.style.display="block";
      const txt=document.getElementById("pnImportTxt");
      if(txt) txt.textContent="La base 2026 de la Compañía (67 actividades de enero a junio) no está cargada. Puedes incorporarla aquí.";
    }else if(imp.status==="fulfilled"){
      cajaImp.style.display="none";
    }
    if(idx.status==="rejected") console.error("Dashboard: índice general no disponible para estado de importación.");
  });

  if(!r.N){
    document.getElementById("pnKpis").innerHTML='<div class="kpi"><div class="v" id="pnGuardiaTurnos">0</div><div class="l">Turnos Guardia registrados</div></div><div class="kpi alto"><div class="v" id="pnGuardiaRealizadas">0</div><div class="l">Guardias realizadas</div></div><div class="kpi medio"><div class="v" id="pnGuardiaSobreMinimo">0</div><div class="l">Voluntarios con más de 2 guardias</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaCedidas">0</div><div class="l">Guardias cedidas</div></div><div class="kpi"><div class="v" id="pnGuardiaParticipantes">0</div><div class="l">Voluntarios con participación en Guardia</div></div><div class="kpi"><div class="v" id="pnGuardiaParticipacionRoster">0%</div><div class="l">% dotación activa con participación</div></div><div class="kpi alto"><div class="v" id="pnGuardiaCumplimiento">0%</div><div class="l">Cumplimiento de noches propias</div></div><div class="kpi alto"><div class="v" id="pnGuardiaCumplen">0</div><div class="l">Voluntarios que cumplieron todas sus noches</div></div><div class="kpi"><div class="v" id="pnGuardiaReemplazos">0</div><div class="l">Reemplazos efectivamente realizados</div></div><div class="kpi"><div class="v" id="pnGuardiaReemplazantes">0</div><div class="l">Voluntarios que realizaron reemplazos</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaConCedidas">0</div><div class="l">Voluntarios que cedieron al menos una noche</div></div><div class="kpi"><div class="v" id="pnGuardiaSinParticipacion">0</div><div class="l">Voluntarios sin participación en Guardia</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaIncompletas">0</div><div class="l">Noches bajo mínimo de guardianes</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaSinObac">0</div><div class="l">Noches sin OBAC</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaSinConductor">0</div><div class="l">Noches sin conductor</div></div>';
    document.getElementById("pnRanking").innerHTML='<h3>Participación en Guardia Nocturna</h3><table><thead><tr><th>N°</th><th>Voluntario</th><th>Asign.</th><th>Propias</th><th>Cumpl.</th><th>Reemplazos</th><th>Cedidas</th><th>Total efectivo</th></tr></thead><tbody id="pnGuardiaRankingBody">'+r.porPersona.map(x=>'<tr><td class="n-col">'+(x.m.n||"")+'</td><td class="name-col">'+esc(nombreCompleto(x.m))+'</td><td>0</td><td>0</td><td>0</td><td>0</td><td><b>0</b></td></tr>').join("")+'</tbody></table>';
    ["pnTipos","pnTramos","pnMeses","pnDetalle","pnConvocatoria","pnHallazgos"]
      .forEach(id=>document.getElementById(id).innerHTML='<div class="empty">Sin actividades generales en este período. Guardia Nocturna se calcula de forma independiente.</div>');
    return;
  }

  document.getElementById("pnKpis").innerHTML=`
    <div class="kpi"><div class="v">${r.N}</div><div class="l">Actividades registradas</div></div>
    <div class="kpi"><div class="v">${ROSTER.length}</div><div class="l">Dotación listada</div></div>
    <div class="kpi alto"><div class="v">${activos.length}</div><div class="l">Voluntarios activos</div></div>
    <div class="kpi bajo"><div class="v">${bajas}</div><div class="l">Bajas</div></div>
    <div class="kpi ${r.global>=50?'alto':r.global>=35?'medio':'bajo'}"><div class="v">${r.global.toFixed(1)}%</div><div class="l">Asistencia activa global</div></div>\n    <div class="kpi"><div class="v">${r.totPres}</div><div class="l">Asistencias registradas</div></div>\n    <div class="kpi"><div class="v">${r.promedio.toFixed(1)}</div><div class="l">Concurrencia promedio por actividad</div></div>\n    <div class="kpi"><div class="v" id="pnGuardiaTurnos">0</div><div class="l">Turnos Guardia registrados</div></div>\n    <div class="kpi alto"><div class="v" id="pnGuardiaRealizadas">0</div><div class="l">Guardias realizadas</div></div>\n    <div class="kpi medio"><div class="v" id="pnGuardiaSobreMinimo">0</div><div class="l">Voluntarios con más de 2 guardias</div></div>\n    <div class="kpi bajo"><div class="v" id="pnGuardiaCedidas">0</div><div class="l">Guardias cedidas</div></div><div class="kpi"><div class="v" id="pnGuardiaParticipantes">0</div><div class="l">Voluntarios con participación en Guardia</div></div><div class="kpi"><div class="v" id="pnGuardiaParticipacionRoster">0%</div><div class="l">% dotación activa con participación</div></div><div class="kpi alto"><div class="v" id="pnGuardiaCumplimiento">0%</div><div class="l">Cumplimiento de noches propias</div></div><div class="kpi alto"><div class="v" id="pnGuardiaCumplen">0</div><div class="l">Voluntarios que cumplieron todas sus noches</div></div><div class="kpi"><div class="v" id="pnGuardiaReemplazos">0</div><div class="l">Reemplazos efectivamente realizados</div></div><div class="kpi"><div class="v" id="pnGuardiaReemplazantes">0</div><div class="l">Voluntarios que realizaron reemplazos</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaConCedidas">0</div><div class="l">Voluntarios que cedieron al menos una noche</div></div><div class="kpi"><div class="v" id="pnGuardiaSinParticipacion">0</div><div class="l">Voluntarios sin participación en Guardia</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaIncompletas">0</div><div class="l">Noches bajo mínimo de guardianes</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaSinObac">0</div><div class="l">Noches sin OBAC</div></div><div class="kpi bajo"><div class="v" id="pnGuardiaSinConductor">0</div><div class="l">Noches sin conductor</div></div>`;

  const listaT=Object.entries(r.tipos).map(([t,d])=>({t,n:d.n,pres:d.pres,tasa:pct(d.pres,d.posibles)}))
                .sort((a,b)=>b.n-a.n);
  document.getElementById("pnTipos").innerHTML =
    listaT.map(x=>`<div class="barra"><div class="et">${esc(x.t)}<br><span style="color:var(--muted);font-size:11.5px;">${x.n} actividad${x.n===1?"":"es"}</span></div>
      <div class="tr"><div style="width:${x.tasa.toFixed(1)}%"></div></div>
      <div class="vl">${x.tasa.toFixed(1)}%</div></div>`).join("")
    + (listaT.length>1 ? (()=>{ const mx=listaT.reduce((a,b)=>a.tasa>b.tasa?a:b), mn=listaT.reduce((a,b)=>a.tasa<b.tasa?a:b);
        return `<div class="aviso">Brecha principal: ${esc(mn.t)} alcanza ${mn.tasa.toFixed(1)}% frente a ${esc(mx.t)} con ${mx.tasa.toFixed(1)}%.</div>`; })() : "");

  const TR=[["50% o más","#4a7c59",x=>x>=50],["35% a 49,9%","#c9a227",x=>x>=35&&x<50],
            ["20% a 34,9%","#d1892a",x=>x>=20&&x<35],["Menos de 20%","#b3241c",x=>x<20]];
  const grupos=TR.map(([et,col,f])=>({et,col,c:r.porPersona.filter(x=>f(x.p)).length}));
  let ang=0; const seg=[];
  grupos.forEach(g=>{ const a2=ang+pct(g.c,activos.length)*3.6; seg.push(`${g.col} ${ang}deg ${a2}deg`); ang=a2; });
  document.getElementById("pnTramos").innerHTML=`
    <div class="dona">
      <div class="circ" style="background:conic-gradient(${seg.join(",")})">
        <i><b>${activos.length}</b><span>voluntarios<br>activos</span></i>
      </div>
      <div class="leyenda">${grupos.map(g=>`<div><em style="background:${g.col}"></em>${g.et} — <b>${g.c}</b> (${pct(g.c,activos.length).toFixed(1)}%)</div>`).join("")}</div>
    </div>`;

  const clavesM=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
  let htmlM=clavesM.map(m=>{
    const t=pct(r.meses[m].pres,r.meses[m].posibles);
    return `<div class="barra"><div class="et">${MESES_NOM[m-1]}<br><span style="color:var(--muted);font-size:11.5px;">${r.meses[m].n} act.</span></div>
      <div class="tr"><div style="width:${t.toFixed(1)}%;background:var(--gold);"></div></div>
      <div class="vl">${t.toFixed(1)}%</div></div>`;
  }).join("");
  if(clavesM.length>1){
    const mejor=clavesM.reduce((a,b)=>pct(r.meses[a].pres,r.meses[a].posibles)>pct(r.meses[b].pres,r.meses[b].posibles)?a:b);
    htmlM+=`<div class="aviso ok">${MESES_NOM[mejor-1]} presenta la mayor tasa: ${pct(r.meses[mejor].pres,r.meses[mejor].posibles).toFixed(1)}%.</div>`;
  }
  document.getElementById("pnMeses").innerHTML=htmlM;

  document.getElementById("pnDetalle").innerHTML=r.porPersona.slice()
    .sort((a,b)=>(a.m.n||999)-(b.m.n||999)).map(x=>{
      const s=stats[x.m.id];
      return `<tr class="asistencia-voluntario" data-asistencia-id="${esc(String(x.m.id))}"><td class="name-col">${x.m.clave?`<span class="clv">${esc(x.m.clave)}</span> `:""}${esc(nombreCompleto(x.m))}</td><td><b>${x.p.toFixed(1)}%</b></td><td><button type="button" class="btn small secondary" data-toggle-asistencia="${esc(String(x.m.id))}" aria-expanded="false">Ver detalle</button></td></tr><tr id="asistencia-detalle-${esc(String(x.m.id))}" class="detalle-extra" style="display:none;"><td colspan="3"><div class="asistencia-detalle" data-detalle-voluntario="${esc(String(x.m.id))}"></div></td></tr>`;
    }).join("");
  document.querySelectorAll("[data-toggle-asistencia]").forEach(btn=>btn.addEventListener("click",async e=>{
    e.stopPropagation();
    const id=btn.dataset.toggleAsistencia, row=document.getElementById("asistencia-detalle-"+id);
    if(!row)return;
    const abrir=row.style.display==="none";
    row.style.display=abrir?"table-row":"none";
    btn.setAttribute("aria-expanded",abrir?"true":"false");
    btn.textContent=abrir?"Ocultar detalle":"Ver detalle";
    if(abrir){
      const cont=row.querySelector("[data-detalle-voluntario]");
      if(cont) await detalleVoluntario(id,cont);
    }
  }));

  const fila=x=>`<tr><td class="n-col">${x.m.n||""}</td>
      <td class="name-col">${x.m.clave?`<span class="clv">${esc(x.m.clave)}</span> `:""}${esc(nombreCompleto(x.m))}</td>
      <td class="cargo-col">${esc(x.m.cargo)}</td>
      <td><span class="pct-bar"><div style="width:${x.p.toFixed(0)}%"></div></span>${x.p.toFixed(1)}%</td></tr>`;
  const tablaGuardia=`<h3>Participación en Guardia Nocturna</h3><table><thead><tr><th>N°</th><th>Voluntario</th><th>Asign.</th><th>Propias</th><th>Cumpl.</th><th>Reemplazos</th><th>Cedidas</th><th>Total efectivo</th></tr></thead><tbody id="pnGuardiaRankingBody">${r.porPersona.map(x=>`<tr><td class="n-col">${x.m.n||""}</td><td class="name-col">${esc(nombreCompleto(x.m))}</td><td>0</td><td>0</td><td>0</td><td>0</td><td><b>0</b></td></tr>`).join("")}</tbody></table>`;
  document.getElementById("pnRanking").innerHTML=tablaGuardia;

  const filaC=x=>`<tr><td>${x.pt.date}</td><td class="name-col">${esc(x.pt.tipo)}${x.pt.detalle?" · "+esc(x.pt.detalle):""}</td>
      <td style="text-align:center;">${x.c}</td><td style="text-align:center;">${x.t.toFixed(1)}%</td></tr>`;
  document.getElementById("pnConvocatoria").innerHTML=`
    <h3>Mayor convocatoria</h3>
    <table><thead><tr><th>Fecha</th><th>Actividad</th><th>Asist.</th><th>Tasa</th></tr></thead>
    <tbody>${r.conv.slice(0,3).map(filaC).join("")}</tbody></table>
    <h3>Menor convocatoria</h3>
    <table><thead><tr><th>Fecha</th><th>Actividad</th><th>Asist.</th><th>Tasa</th></tr></thead>
    <tbody>${r.conv.slice(-3).reverse().map(filaC).join("")}</tbody></table>`;

  const peorTipo=listaT.reduce((a,b)=>a.tasa<b.tasa?a:b);
  document.getElementById("pnHallazgos").innerHTML=`
    <div class="kpis">
      <div class="kpi"><div class="v">${r.global.toFixed(1)}%</div><div class="l">Cumplimiento de asistencia individual sobre obligaciones vigentes</div></div>
      <div class="kpi medio"><div class="v">${r.mediana.toFixed(1)}%</div><div class="l">Mediana individual según obligaciones propias</div></div>
      <div class="kpi"><div class="v">${r.promedio.toFixed(1)}</div><div class="l">Concurrencia promedio de voluntarios por actividad</div></div>
    </div>
    <div class="aviso">Punto de atención: ${esc(peorTipo.t)} es la actividad con menor participación (${peorTipo.tasa.toFixed(1)}%).</div>`;
}
on("pnAnio","change",renderPanel);
on("pnMes","change",renderPanel);

/* ---- INFORMES EN PDF ---- */
async function generarInforme(desde,hasta,etiqueta,conMeses){
  const {partes,activos,stats}=await datosPanel(desde,hasta);
  const r=resumen(partes,activos,stats);
  if(!r.N){ alert("No hay actividades registradas en ese período."); return; }
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"INFORME DE ASISTENCIA");
  doc.setFontSize(10); doc.setFont("helvetica","bold");
  doc.text(etiqueta,35,33);
  doc.setFont("helvetica","normal"); doc.setFontSize(8);
  doc.text(`Período ${desde} al ${hasta} · emitido el ${new Date().toLocaleDateString("es-CL")}`,35,37.5);

  doc.autoTable({startY:44,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]},
    head:[["Resumen general",""]],
    body:[["Actividades registradas",String(r.N)],
          ["Dotación listada",String(ROSTER.length)],
          ["Voluntarios activos",String(activos.length)],
          ["Bajas",String(ROSTER.filter(m=>m.activo===false).length)],
          ["Asistencias registradas",`${r.totPres} de ${r.posibles} posibles`],
          ["Asistencia activa global",r.global.toFixed(1)+"%"],
          ["Mediana individual",r.mediana.toFixed(1)+"%"],
          ["Concurrencia promedio",(r.totPres/r.N).toFixed(1)+" voluntarios por actividad"]]});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
    head:[["Tipo de actividad","N°","Asistencias","Tasa"]],
    body:Object.entries(r.tipos).sort((a,b)=>b[1].n-a[1].n)
      .map(([t,d])=>[t,String(d.n),String(d.pres),pct(d.pres,d.posibles).toFixed(1)+"%"])});

  if(conMeses){
    const cm=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
    doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:9},headStyles:{fillColor:[100,90,80]},
      head:[["Mes","Actividades","Asistencias","Tasa"]],
      body:cm.map(m=>[MESES_NOM[m-1],String(r.meses[m].n),String(r.meses[m].pres),
                      pct(r.meses[m].pres,r.meses[m].posibles).toFixed(1)+"%"])});
  }

  doc.addPage();
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text("DETALLE POR VOLUNTARIO",14,20);
  doc.autoTable({startY:26,styles:{fontSize:8},headStyles:{fillColor:[179,36,28]},
    head:[["N°","Clave","Voluntario","Cargo","Asist.","Faltas","Tasa"]],
    body:r.porPersona.map(x=>[x.m.n||"",x.m.clave||"—",nombreCompleto(x.m),x.m.cargo,
      String(x.pres),String(r.N-x.pres),x.p.toFixed(1)+"%"])});

  doc.autoTable({startY:doc.lastAutoTable.finalY+6,styles:{fontSize:8},headStyles:{fillColor:[100,90,80]},
    head:[["Fecha","Actividad","Asistentes","Tasa"]],
    body:r.conv.slice().sort((a,b)=>a.pt.date<b.pt.date?-1:1)
      .map(x=>[x.pt.date,(x.pt.tipo||"")+(x.pt.detalle?" · "+x.pt.detalle:""),String(x.c),x.t.toFixed(1)+"%"])});

  let fy=doc.lastAutoTable.finalY+18;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Ayudante",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Capitán",115,fy+5);
  doc.setFontSize(8);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+16);

  await sharePdfDoc(doc,`informe_asistencia_${slug(etiqueta)}.pdf`,`Informe de asistencia · ${etiqueta}`);
}

on("pnPdf","click",async()=>{
  const R=rangoPanel();
  await generarInforme(R.desde,R.hasta,R.etiqueta,R.modo!=="mes");
});

/* ---- INFOGRAFIA ---- */
function construirInfografia(R, r, activos){
  const f1=x=>x.toFixed(1);
  const cap=s=>String(s||"").toLowerCase().replace(/(^|\s)\S/g,c=>c.toUpperCase());
  const tipos=Object.entries(r.tipos).map(([t,d])=>({t,n:d.n,p:d.pres,tasa:pct(d.pres,d.n*activos.length)}))
                .sort((a,b)=>b.n-a.n);
  const maxBar=Math.max(...tipos.map(t=>t.p),1);
  const peor=tipos.length?tipos.reduce((a,b)=>a.tasa<b.tasa?a:b):{t:"—",tasa:0};
  const mejor=tipos.length?tipos.reduce((a,b)=>a.tasa>b.tasa?a:b):{t:"—",tasa:0};
  const mk=Object.keys(r.meses).map(Number).sort((a,b)=>a-b);
  const maxMes=Math.max(...mk.map(m=>r.meses[m].n),1);
  const mejorMes=mk.length?mk.reduce((a,b)=>pct(r.meses[a].pres,r.meses[a].n*activos.length)>pct(r.meses[b].pres,r.meses[b].n*activos.length)?a:b):null;
  const TR=[["50% o más","#16a34a",v=>v>=50],["35% a 49,9%","#eab308",v=>v>=35&&v<50],
            ["20% a 34,9%","#f97316",v=>v>=20&&v<35],["Menos de 20%","#dc2626",v=>v<20]];
  const grupos=TR.map(([et,col,fn])=>({et,col,c:r.porPersona.filter(x=>fn(x.p)).length}));
  let ang=0; const seg=grupos.map(g=>{const a2=ang+pct(g.c,activos.length)*3.6;const s=`${g.col} ${ang}deg ${a2}deg`;ang=a2;return s;});
  const bajas=ROSTER.filter(m=>m.activo===false).length;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=1180">
<title>Asistencias · Quinta Compañía</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}
body{background:#e8edf3;font-family:'Source Sans 3',sans-serif;color:#1e293b;padding:18px}
.hoja{max-width:1120px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 3px 18px rgba(0,0,0,.13)}
.top{background:linear-gradient(135deg,#13315c,#1e4d8c);color:#fff;padding:20px 26px;display:flex;align-items:center;gap:22px}
.top img{width:62px;height:68px;object-fit:contain}
.top h1{font-family:'Barlow Condensed',sans-serif;font-size:38px;line-height:1}
.top h2{font-size:14.5px;font-weight:600;opacity:.95;margin-top:2px}
.lema{font-family:'Barlow Condensed',sans-serif;font-size:11.5px;letter-spacing:3px;opacity:.75;margin-top:5px}
.corte{margin-left:auto;text-align:right;background:rgba(255,255,255,.12);border-radius:7px;padding:9px 14px;font-size:12px}
.corte b{display:block;font-size:15px;margin-top:2px}
.cuerpo{padding:16px}
.sec{border:1px solid #d3dceb;border-radius:8px;margin-bottom:13px;overflow:hidden}
.sec>h3{background:#13315c;color:#fff;font-family:'Barlow Condensed',sans-serif;font-size:16px;letter-spacing:.6px;padding:8px 14px}
.sec>.in{padding:14px}
.kpis{display:grid;grid-template-columns:repeat(5,1fr);gap:11px}
.k{border-radius:8px;padding:13px;text-align:center;border:1px solid #dbe4f0;background:#f4f8fd}
.k .n{font-family:'Barlow Condensed',sans-serif;font-size:34px;line-height:1;color:#13315c}
.k .t{font-size:11.5px;color:#5b6b82;margin-top:4px;font-weight:600}
.k.v{background:#eefbf2;border-color:#b9e6c8}.k.v .n{color:#16a34a}
.k.r{background:#fdeded;border-color:#f6c6c6}.k.r .n{color:#dc2626}
.g3{display:grid;grid-template-columns:1.25fr .85fr .95fr;gap:13px}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:13px}
.bar{display:flex;align-items:center;gap:9px;margin-bottom:9px}
.bar .et{flex:0 0 34%;font-size:12.5px;font-weight:600}
.bar .et i{display:block;font-style:normal;font-weight:400;color:#7b8798;font-size:11px}
.bar .tr{flex:1;background:#eef2f8;border-radius:4px;height:19px}
.bar .tr>div{height:100%;border-radius:4px;background:linear-gradient(90deg,#2f6fb8,#4d8fd6)}
.bar .vl{flex:0 0 52px;text-align:right;font-weight:700;font-size:12.5px;color:#13315c}
table{width:100%;border-collapse:collapse;font-size:11.5px}
th{background:#eaf0f8;color:#13315c;font-weight:700;padding:6px;text-align:left;border:1px solid #d3dceb}
td{padding:5px 6px;border:1px solid #e3e9f2}
.dona{display:flex;flex-direction:column;align-items:center;gap:11px}
.circ{width:150px;height:150px;border-radius:50%;position:relative}
.circ i{position:absolute;inset:32px;background:#fff;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;font-style:normal}
.circ i b{font-family:'Barlow Condensed',sans-serif;font-size:34px;color:#13315c;line-height:1}
.circ i span{font-size:10.5px;color:#6b7a8f;text-align:center;line-height:1.25}
.leg{width:100%}.leg div{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:3px 0}
.leg em{width:11px;height:11px;border-radius:3px;flex:0 0 auto}.leg b{margin-left:auto}
.nota{border-radius:7px;padding:10px 12px;font-size:11.5px;margin-top:10px;line-height:1.4}
.nota.mal{background:#fdeded;border:1px solid #f6c6c6;color:#8f1d1d}
.nota.bien{background:#eefbf2;border:1px solid #b9e6c8;color:#15683a}
.mini h4{font-size:12.5px;margin-bottom:7px;padding:5px 9px;border-radius:5px}
.mini.up h4{background:#eefbf2;color:#15683a}.mini.dn h4{background:#fdeded;color:#8f1d1d}
.hall{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
.h{border:1px solid #dbe4f0;border-radius:8px;padding:12px;background:#f9fbfe}
.h .n{font-family:'Barlow Condensed',sans-serif;font-size:30px;color:#13315c;line-height:1}
.h .t{font-size:10.8px;color:#5b6b82;margin-top:5px;line-height:1.35}
.concl{background:#f4f8fd;border:1px solid #dbe4f0;border-radius:8px;padding:13px;font-size:12.5px;line-height:1.55}
.pie{background:#13315c;color:#fff;padding:12px 22px;display:flex;justify-content:space-between;align-items:center;font-size:11px;line-height:1.5}
.pie .lm{font-family:'Barlow Condensed',sans-serif;letter-spacing:2.5px;opacity:.8}
@media print{body{background:#fff;padding:0}.hoja{box-shadow:none}}
</style></head><body><div class="hoja">
<div class="top"><img src="${LOGO_B64}" alt="">
<div><h1>ASISTENCIAS ${R.anio}</h1>
<h2>Quinta Compañía "Germania" — Cuerpo de Bomberos de Villarrica</h2>
<div class="lema">DISCIPLINA &nbsp;•&nbsp; SERVICIO &nbsp;•&nbsp; COMPAÑERISMO</div></div>
<div class="corte">${esc(R.modo==="acum"?"Acumulado a la fecha":R.modo==="anio"?"Año completo":"Período")}<b>${fmtDateLong(R.hasta)}</b></div></div>
<div class="cuerpo">

<div class="sec"><h3>1. RESUMEN GENERAL</h3><div class="in"><div class="kpis">
<div class="k"><div class="n">${r.N}</div><div class="t">Actividades registradas</div></div>
<div class="k"><div class="n">${ROSTER.length}</div><div class="t">Dotación listada</div></div>
<div class="k v"><div class="n">${activos.length}</div><div class="t">Voluntarios activos</div></div>
<div class="k r"><div class="n">${bajas}</div><div class="t">Bajas</div></div>
<div class="k"><div class="n">${f1(r.global)}%</div><div class="t">Asistencia activa global</div></div>
</div></div></div>

<div class="g3">
<div class="sec"><h3>2. ASISTENCIA POR TIPO</h3><div class="in">
${tipos.map(t=>`<div class="bar"><div class="et">${esc(t.t)}<i>${t.n} actividad${t.n===1?"":"es"}</i></div>
<div class="tr"><div style="width:${(t.p/maxBar*100).toFixed(0)}%"></div></div><div class="vl">${f1(t.tasa)}%</div></div>`).join("")}
<table><tr><th>Tipo</th><th>N°</th><th>Asist.</th><th>Tasa</th></tr>
${tipos.map(t=>`<tr><td>${esc(t.t)}</td><td>${t.n}</td><td>${t.p}</td><td><b>${f1(t.tasa)}%</b></td></tr>`).join("")}</table>
${tipos.length>1?`<div class="nota mal"><b>Brecha principal:</b> ${esc(peor.t)} alcanza ${f1(peor.tasa)}% frente a ${esc(mejor.t)} con ${f1(mejor.tasa)}%.</div>`:""}
</div></div>

<div class="sec"><h3>3. DISTRIBUCIÓN INDIVIDUAL</h3><div class="in"><div class="dona">
<div class="circ" style="background:conic-gradient(${seg.join(",")})"><i><b>${activos.length}</b><span>voluntarios<br>activos</span></i></div>
<div class="leg">${grupos.map(g=>`<div><em style="background:${g.col}"></em>${g.et}<b>${g.c} (${f1(pct(g.c,activos.length))}%)</b></div>`).join("")}</div>
</div></div></div>

<div class="sec"><h3>4. EVOLUCIÓN MENSUAL</h3><div class="in">
${mk.map(m=>{const t=pct(r.meses[m].pres,r.meses[m].n*activos.length);
return `<div class="bar"><div class="et" style="flex:0 0 30%">${MESES_NOM[m-1]}<i>${r.meses[m].n} act.</i></div>
<div class="tr"><div style="width:${t.toFixed(1)}%"></div></div><div class="vl">${f1(t)}%</div></div>`}).join("")}
${mejorMes?`<div class="nota bien"><b>${MESES_NOM[mejorMes-1]}</b> presenta la mayor tasa: <b>${f1(pct(r.meses[mejorMes].pres,r.meses[mejorMes].n*activos.length))}%</b>.</div>`:""}
</div></div></div>

<div class="g2">
<div class="sec"><h3>5. RANKING — MAYOR ASISTENCIA</h3><div class="in">
<table><tr><th>#</th><th>Voluntario/a</th><th>Cargo</th><th>%</th></tr>
${r.porPersona.slice(0,5).map((x,i)=>`<tr><td>${i+1}</td><td>${esc(nombreCompleto(x.m))}</td><td>${esc(x.m.cargo)}</td><td><b>${f1(x.p)}%</b></td></tr>`).join("")}</table>
<div class="nota bien"><b>${r.porPersona.filter(x=>x.p>=50).length} voluntarios activos</b> alcanzan al menos 50% de asistencia.</div>
</div></div>

<div class="sec"><h3>6. CONVOCATORIA DE ACTIVIDADES</h3><div class="in"><div class="g2">
<div class="mini up"><h4>Mayor convocatoria</h4>
<table><tr><th>Fecha</th><th>Actividad</th><th>N°</th></tr>
${r.conv.slice(0,3).map(x=>`<tr><td>${x.pt.date.slice(8)}-${x.pt.date.slice(5,7)}</td><td>${esc(cap(x.pt.detalle||x.pt.tipo))}</td><td><b>${x.c}</b></td></tr>`).join("")}</table></div>
<div class="mini dn"><h4>Menor convocatoria</h4>
<table><tr><th>Fecha</th><th>Actividad</th><th>N°</th></tr>
${r.conv.slice(-3).reverse().map(x=>`<tr><td>${x.pt.date.slice(8)}-${x.pt.date.slice(5,7)}</td><td>${esc(cap(x.pt.detalle||x.pt.tipo))}</td><td><b>${x.c}</b></td></tr>`).join("")}</table></div>
</div></div></div></div>

<div class="sec"><h3>7. HALLAZGOS CLAVE</h3><div class="in"><div class="hall">
<div class="h"><div class="n">${r.totPres}</div><div class="t">asistencias sobre <b>${r.posibles}</b> participaciones posibles</div></div>
<div class="h"><div class="n">${f1(r.mediana)}%</div><div class="t">es la mediana de asistencia individual</div></div>
<div class="h"><div class="n">${r.porPersona.filter(x=>x.p<20).length}</div><div class="t">voluntarios activos bajo 20% de asistencia</div></div>
<div class="h"><div class="n">${(r.totPres/r.N).toFixed(1)}</div><div class="t">voluntarios concurren en promedio a cada actividad</div></div>
</div></div></div>

<div class="sec"><h3>8. CONCLUSIÓN</h3><div class="in"><div class="concl">
${esc(R.etiqueta||"En el período analizado")}, la Quinta Compañía registra una asistencia activa global de <b>${f1(r.global)}%</b>, con ${r.N} actividades y ${activos.length} voluntarios activos.
${tipos.length>1?`La actividad con menor participación es ${esc(peor.t.toLowerCase())} (${f1(peor.tasa)}%), frente a ${esc(mejor.t.toLowerCase())} que alcanza ${f1(mejor.tasa)}%.`:""}
${r.porPersona.filter(x=>x.p<20).length} voluntarios se mantienen bajo el 20% de asistencia.
</div></div></div>

</div>
<div class="pie"><div><b>Desarrollado por la 5ta Compañía "Germania"</b> · Cuerpo de Bomberos de Villarrica · Chile<br>
<span style="opacity:.72">Fuente: registro de asistencias de la Compañía · generado el ${new Date().toLocaleDateString("es-CL")}</span></div>
<div class="lm">VOLUNTAD HOY, COMUNIDAD SIEMPRE</div></div>
</div></body></html>`;
}

on("pnInfo","click",async()=>{
  await poblarSelectoresPanel();
  const R=rangoPanel();
  R.anio=R.desde.slice(0,4);
  const {partes,activos,stats}=await datosPanel(R.desde,R.hasta);
  const r=resumen(partes,activos,stats);
  if(!r.N){ alert("No hay actividades registradas en ese período."); return; }
  const doc=construirInfografia(R,r,activos);
  const blob=new Blob([doc],{type:"text/html;charset=utf-8"});
  await entregarArchivo(blob,`infografia_${slug(R.etiqueta)}.html`,R.etiqueta,"Infografía generada");
});

on("pnCsv","click",async()=>{
  const R=rangoPanel();
  const {partes,activos,stats}=await datosPanel(R.desde,R.hasta);
  const r=resumen(partes,activos,stats);
  const rows=[["Período",R.etiqueta],["Actividades",r.N],[],
    ["N°","Clave","Voluntario","Cargo","Asistencias","Faltas","% Asistencia"]];
  r.porPersona.forEach(x=>rows.push([x.m.n||"",x.m.clave||"",nombreCompleto(x.m),x.m.cargo,
    x.pres,r.N-x.pres,x.p.toFixed(1)+"%"]));
  const csv=rows.map(f=>f.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8;"});
  await entregarArchivo(blob,`informe_${slug(R.etiqueta)}.csv`,R.etiqueta,"Planilla generada");
});

/* ============ OFICIALIDAD ============ */
function cargosValidos(){ return CARGOS.concat(["Voluntario","Aspirante","Postulante"]); }
/* Opciones de un <select> de cargo. Si el valor actual no esta en la lista
   (dato antiguo mal escrito) se conserva visible y marcado, para no perderlo. */
function cargoSelectOptions(actual){
  const lista=cargosValidos();
  const extra=(actual && !lista.includes(actual)) ? `<option value="${esc(actual)}" selected>⚠ ${esc(actual)} (no estándar)</option>` : "";
  return extra + lista.map(c=>`<option value="${esc(c)}" ${c===actual?"selected":""}>${esc(c)}</option>`).join("");
}
function renderCargoOptions(){
  const dl=document.getElementById("cargoOptions");
  if(dl) dl.innerHTML=cargosValidos().map(c=>`<option value="${esc(c)}"></option>`).join("");
  const fi=document.getElementById("fiCargo");
  if(fi && fi.tagName==="SELECT"){ const cur=fi.value||"Voluntario"; fi.innerHTML=cargoSelectOptions(cur); }
}
function renderOficialidad(asignaciones){
  const body=document.getElementById("oficialidadBody"); body.innerHTML="";
  const opts = '<option value="">— sin asignar —</option>' +
    sortedRoster(true).map(p=>`<option value="${p.id}">${esc(nombreCompleto(p))}</option>`).join("");
  CARGOS.forEach(cargo=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${esc(cargo)}</td>
      <td><select class="ofi-select" data-cargo="${esc(cargo)}">${opts}</select></td>
      <td><button class="del-btn" data-del-cargo="${esc(cargo)}" title="Quitar cargo">🗑</button></td>`;
    body.appendChild(tr);
    const sel=tr.querySelector("select");
    if(asignaciones && asignaciones[cargo]) sel.value=asignaciones[cargo];
  });
  body.querySelectorAll("[data-del-cargo]").forEach(b=>b.addEventListener("click",async()=>{
    CARGOS=CARGOS.filter(c=>c!==b.dataset.delCargo);
    await saveCargos(); renderCargoOptions(); loadOficialidadYear();
  }));
}
/* Códigos funcionales de Oficialidad.
   REGLA GERMANIA: el código de Oficial pertenece al CARGO, no a la persona.
   El voluntario conserva siempre su código personal (m.clave). Mientras ejerce
   un cargo, los documentos/operaciones que correspondan usan el código
   funcional del cargo. Al dejarlo, vuelve a operar con su código personal y
   el código funcional queda disponible para el nuevo titular. */
const CODIGO_OFICIAL_POR_CARGO={
  "Director":"75","Capitán":"45","Tesorero General":"9",
  "Teniente 1":"501","Teniente 2":"502","Teniente 3":"503",
  "Ayudante":"504","Jefe de Máquinas":"505","Secretario":"506","Tesorero":"507"
};
function codigoOperativo(m,cargo){
  return (cargo&&CODIGO_OFICIAL_POR_CARGO[cargo]) || (m&&m.clave) || "";
}
/* Para años sin registro guardado se precarga desde el cargo vigente de la
   nómina. Nunca se deduce el titular comparando su código personal con un
   código funcional de Oficialidad. */
function oficialidadDesdeNomina(){
  const asign={};
  CARGOS.forEach(cargo=>{
    const m=ROSTER.find(p=>p.activo!==false && p.cargo===cargo);
    if(m) asign[cargo]=m.id;
  });
  return asign;
}
async function loadOficialidadYear(){
  const input=document.getElementById("anioOficialidad");
  const msg=document.getElementById("oficialidadMsg");
  const anio=String(input?.value||"").trim();
  if(!/^\d{4}$/.test(anio)||Number(anio)<2023||Number(anio)>2100){
    if(msg){msg.textContent="Indica un año válido entre 2023 y 2100.";msg.classList.add("err");}
    return;
  }
  if(msg){msg.textContent="Cargando "+anio+"…";msg.classList.remove("err");}
  try{
    const data=await sGet("oficialidad:"+anio,null);
    renderOficialidad(data||oficialidadDesdeNomina());
    if(msg) msg.textContent=data?"Oficialidad guardada para "+anio+".":"No hay oficialidad guardada para "+anio+" — se rescataron automáticamente los cargos vigentes en la nómina. Revisa y guarda para dejarlo registrado.";
  }catch(e){
    console.error("No se pudo cargar oficialidad",e);
    renderOficialidad({});
    if(msg){msg.textContent="No fue posible cargar la oficialidad de "+anio+".";msg.classList.add("err");}
  }
}
on("anioOficialidad","change",loadOficialidadYear);
on("agregarCargoBtn","click",async()=>{
  const inp=document.getElementById("nuevoCargoInput"), v=inp.value.trim();
  if(!v||CARGOS.includes(v)) return;
  CARGOS.push(v); await saveCargos(); inp.value="";
  renderCargoOptions(); loadOficialidadYear();
});
on("guardarOficialidadBtn","click",async()=>{
  const anio=document.getElementById("anioOficialidad").value;
  const msg=document.getElementById("oficialidadMsg");
  if(!anio){ msg.textContent="Indica el año."; msg.classList.add("err"); return; }
  const asign={};
  document.querySelectorAll(".ofi-select").forEach(sel=>{ if(sel.value) asign[sel.dataset.cargo]=sel.value; });
  await sSet("oficialidad:"+anio,asign);
  // aplicar a la nómina: limpiar cargos de oficialidad previos y asignar los nuevos
  const asignados=new Set(Object.values(asign));
  ROSTER.forEach(m=>{
    if(cargoPriority(m.cargo)!==99 && !asignados.has(m.id)){
      m.cargo = (m.categoria==="Aspirante") ? "Aspirante" : "Voluntario";
    }
  });
  Object.entries(asign).forEach(([cargo,id])=>{
    const m=ROSTER.find(x=>x.id===id); if(!m) return;
    m.cargo=cargo;
    if(!m.anotaciones) m.anotaciones=[];
    const codigoFuncional=codigoOperativo(m,cargo);
    const detalle=`Ejerció como ${cargo} durante ${anio}. Código funcional del cargo: ${codigoFuncional}. Código personal conservado: ${m.clave||"sin registrar"}.`;
    if(!m.anotaciones.some(a=>a.tipo==="Cargo"&&a.detalle===detalle)){
      m.anotaciones.push({id:uid(),tipo:"Cargo",fecha:anio+"-01-01",institucion:"5ª Compañía Germania",detalle});
    }
  });
  await saveRoster();
  msg.classList.remove("err");
  msg.textContent=`Oficialidad ${anio} guardada y aplicada a la nómina.`;
  renderListaRows(); renderCfgRoster(); renderRegistradoPorOptions(); renderCursoMiembroSelect(); renderSvTipoOptions(); renderMntTipoOptions(); renderBuscadorOpciones();
});

/* ============ FICHA DE INGRESO ============ */
on("registrarIngresoBtn","click",async()=>{
  const g=id=>document.getElementById(id).value.trim();
  const msg=document.getElementById("fiMsg");
  if(!g("fiNombre")||!g("fiApPat")){ msg.textContent="Nombre y apellido paterno son obligatorios."; msg.classList.add("err"); return; }
  const cat=document.getElementById("fiCategoria").value;
  ROSTER.push({
    id:uid(), n:null,
    nombre:g("fiNombre"), apellidoPaterno:g("fiApPat"), apellidoMaterno:g("fiApMat"),
    rut:g("fiRut"), fechaNacimiento:g("fiNac"), fechaIngreso:g("fiIngreso")||todayISO(),
    categoria:cat, formaIngreso:document.getElementById("fiForma").value, origen:g("fiOrigen"),
    especialidad:g("fiEspecialidad"),
    telefono:g("fiTelefono"), cargo:g("fiCargo")|| (cat==="Aspirante"?"Aspirante":cat==="Postulante"?"Postulante":"Voluntario"),
    activo:true, cursos:{}
  });
  await renumerarYGuardar();
  const nuevo=ROSTER.find(m=>m.apellidoPaterno===g("fiApPat")&&m.nombre===g("fiNombre"));
  msg.classList.remove("err");
  msg.textContent=`${g("fiNombre")} ${g("fiApPat")} fue registrado con el N° ${nuevo?nuevo.n:""}.`;
  ["fiNombre","fiApPat","fiApMat","fiRut","fiNac","fiIngreso","fiOrigen","fiEspecialidad","fiCargo","fiTelefono"].forEach(i=>document.getElementById(i).value=""); document.getElementById("fiCargo").value="Voluntario";
  refrescarTodo();
});

/* ============ NÓMINA ============ */
const CATEGORIAS=["Postulante","Aspirante","Operativo","No operativo","Honorario"];
function renderCfgRoster(){
  const body=document.getElementById("cfgRosterBody"); body.innerHTML="";
  sortedRoster(true).forEach(p=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td class="n-col">${p.activo===false?"—":(p.n||"")}</td>
      <td><input type="text" data-f="clave" value="${esc(p.clave||"")}" style="width:56px;"></td>
      <td><input type="text" data-f="nombre" value="${esc(p.nombre)}"></td>
      <td><input type="text" data-f="apellidoPaterno" value="${esc(p.apellidoPaterno)}"></td>
      <td><input type="text" data-f="apellidoMaterno" value="${esc(p.apellidoMaterno)}"></td>
      <td><input type="text" data-f="rut" value="${esc(p.rut)}"></td>
      <td><input type="text" data-f="telefono" value="${esc(p.telefono||"")}"></td>
      <td><select data-f="cargo">${cargoSelectOptions(p.cargo)}</select></td>
      <td><select data-f="categoria">${CATEGORIAS.map(c=>`<option value="${c}" ${p.categoria===c?"selected":""}>${c}</option>`).join("")}</select></td>
      <td><input type="date" data-f="fechaIngreso" value="${esc(p.fechaIngreso||FOUNDING_DATE)}"></td>
      <td><input type="text" data-f="origen" value="${esc(p.origen||"")}" placeholder="Compañía de origen"></td>
      <td><input type="text" data-f="especialidad" value="${esc(p.especialidad||"")}" placeholder="Especialidad"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="conductor" ${p.conductor?"checked":""} title="Cumple función de conductor de la unidad"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="operativoRadio" ${p.operativoRadio?"checked":""} title="Oficial operativo autorizado a identificarse por clave en enlace radial"></td>
      <td style="text-align:center;"><input type="checkbox" data-f="activo" ${p.activo!==false?"checked":""}></td>
      <td><button class="del-btn" data-del="${p.id}" title="Eliminar">🗑</button></td>`;
    tr.querySelectorAll("[data-f]").forEach(inp=>inp.addEventListener("change",async()=>{
      const f=inp.dataset.f;
      let v;
      if(f==="activo"||f==="operativoRadio"||f==="conductor") v=inp.checked;
      else v=inp.value;
      const m=ROSTER.find(x=>x.id===p.id);
      if(m){
        m[f]=v;
        if(f==="fechaIngreso"||f==="activo") await renumerarYGuardar(); else await saveRoster();
        renderListaRows(); renderRegistradoPorOptions(); renderCursoMiembroSelect(); renderBajasSelects(); renderBajasList();
        if(f==="cargo"||f==="fechaIngreso"||f==="activo") renderCfgRoster();
      }
    }));
    tr.querySelector("[data-del]").addEventListener("click",async()=>{
      if(!confirm(`¿Eliminar a ${nombreCompleto(p)} de la nómina? El historial ya guardado no se modifica.\n\nSi solo se retiró de la Compañía, es mejor darlo de baja en la sección "Bajas y eliminación".`)) return;
      ROSTER=ROSTER.filter(x=>x.id!==p.id); await renumerarYGuardar();
      refrescarTodo();
    });
    body.appendChild(tr);
  });
}

/* ============ FICHA Y HOJA DE VIDA ============ */
function hvActual(){ return ROSTER.find(m=>m.id===document.getElementById("hvMiembro").value); }

function renderHvSelect(){
  const sel=document.getElementById("hvMiembro"), cur=sel.value;
  sel.innerHTML=sortedRoster(true).map(p=>{
    const a=acronimoCargo(p);
    return `<option value="${p.id}">N°${p.n} — ${esc(nombreCompleto(p))}${a?" ("+esc(a)+")":""}${p.activo===false?" [baja]":""}</option>`;
  }).join("");
  if(ROSTER.find(m=>m.id===cur)) sel.value=cur;
}

function renderHvInstitucional(){
  const m=hvActual(), box=document.getElementById("hvInstitucional");
  if(!m){ box.innerHTML='<div class="empty">Selecciona un integrante.</div>'; return; }
  const filas=[
    ["N° de lista", m.n||"—"],
    ["Clave radial", m.clave||"—"],
    ["Nombre completo", nombreCompleto(m)],
    ["RUT", m.rut||"—"],
    ["Autorizado a enlace radial", m.operativoRadio?"Sí (oficial operativo)":"No"],
    ["Conductor de unidad", m.conductor?"Sí":"No"],
    ["Cargo actual", m.cargo||"—"],
    ["Calidad", m.categoria||"—"],
    ["Ingreso original bomberil", m.fechaIngresoBomberil||m.fechaIngreso||"—"],
    ["Ingreso a Germania", m.fechaIngreso||"—"],
    ["Forma de ingreso", m.formaIngreso||"—"],
    ["Procedencia", m.origen||"—"],
    ["Especialidad", m.especialidad||"—"],
    ["Situación", m.activo===false ? `Dado de baja (${m.motivoBaja||"sin motivo"}${m.fechaBaja?", "+m.fechaBaja:""})` : "Activo"]
  ];
  box.innerHTML='<table><tbody>'+filas.map(f=>
    `<tr><td style="color:var(--muted);width:44%;">${esc(f[0])}</td><td class="name-col">${esc(f[1])}</td></tr>`).join('')+'</tbody></table>';
}

function renderHvDatos(){
  const m=hvActual();
  document.querySelectorAll("[data-hv]").forEach(inp=>{
    inp.value = m ? (m[inp.dataset.hv]||"") : "";
    inp.disabled = !m;
  });
}
document.querySelectorAll("[data-hv]").forEach(inp=>{
  inp.addEventListener("change",async()=>{
    const m=hvActual(); if(!m) return;
    m[inp.dataset.hv]=inp.value;
    await saveRoster();
    if(inp.dataset.hv==="fechaNacimiento") renderHvInstitucional();
  });
});

async function renderHvFoto(){
  const m=hvActual(), img=document.getElementById("hvFoto");
  if(!img) return;
  if(!m){ img.src=fotoPlaceholder(); return; }
  if(!m.foto){
    const anterior=await sGet(fotoKey(m.id),null);
    if(anterior){ m.foto=anterior; await saveRoster(); }
  }
  img.src=fotoVoluntario(m);
}
/* ============ FOTOS DE VOLUNTARIOS: se reducen al subir ============
   Cada foto se ajusta sola a 200 x 200 px (recorte centrado) y se comprime a
   WebP (o JPEG si el navegador no soporta WebP) hasta quedar en 15 KB como
   máximo. Así la nómina nunca crece sin control ni deja de guardarse. */
const FOTO_LADO_PX=200, FOTO_MAX_BYTES=15*1024, FOTO_ENTRADA_MAX_BYTES=20*1024*1024;
function bytesDeDataUrl(u){
  const t=String(u||""), i=t.indexOf(","); if(i<0) return 0;
  const b64=t.slice(i+1), pad=b64.endsWith("==")?2:(b64.endsWith("=")?1:0);
  return Math.floor(b64.length*3/4)-pad;
}
function cargarImagenParaFoto(src){
  return new Promise((resolve,reject)=>{
    const img=new Image();
    img.onload=()=>resolve(img);
    img.onerror=()=>reject(new Error("No se pudo leer la imagen."));
    img.src=src;
  });
}
async function reducirFoto(origen){
  const esUrl=typeof origen==="string";
  if(!esUrl){
    if(!/^image\//.test(origen.type||"")) throw new Error("El archivo no es una imagen.");
    if(origen.size>FOTO_ENTRADA_MAX_BYTES) throw new Error("La imagen original es demasiado grande (máximo 20 MB).");
  }
  let url=null, fuente=null, cerrar=()=>{};
  try{
    if(!esUrl && typeof createImageBitmap==="function"){
      try{ const b=await createImageBitmap(origen,{imageOrientation:"from-image"}); fuente=b; cerrar=()=>{ try{ b.close(); }catch(e){} }; }
      catch(e){ fuente=null; }
    }
    if(!fuente){
      url=esUrl?origen:URL.createObjectURL(origen);
      fuente=await cargarImagenParaFoto(url);
    }
    const w=fuente.width||fuente.naturalWidth, h=fuente.height||fuente.naturalHeight;
    if(!w||!h) throw new Error("No se pudo leer la imagen.");
    const lado=Math.min(w,h), sx=Math.floor((w-lado)/2), sy=Math.floor((h-lado)/2);
    const lienzo=document.createElement("canvas");
    lienzo.width=FOTO_LADO_PX; lienzo.height=FOTO_LADO_PX;
    const ctx=lienzo.getContext("2d");
    ctx.fillStyle="#fff"; ctx.fillRect(0,0,FOTO_LADO_PX,FOTO_LADO_PX);
    ctx.imageSmoothingQuality="high";
    ctx.drawImage(fuente,sx,sy,lado,lado,0,0,FOTO_LADO_PX,FOTO_LADO_PX);
    for(const formato of ["image/webp","image/jpeg"]){
      for(const calidad of [0.82,0.72,0.62,0.52,0.42,0.32]){
        const u=lienzo.toDataURL(formato,calidad);
        if(!u.startsWith("data:"+formato)) break; /* el navegador no soporta este formato */
        if(bytesDeDataUrl(u)<=FOTO_MAX_BYTES) return u;
      }
    }
    throw new Error("No fue posible reducir la foto a "+Math.round(FOTO_MAX_BYTES/1024)+" KB. Prueba con otra imagen.");
  } finally {
    cerrar();
    if(url && !esUrl) URL.revokeObjectURL(url);
  }
}
/* Reduce, guarda en la nómina y, si el guardado falla, deja todo como estaba. */
async function guardarFotoVoluntario(m,archivo){
  const nueva=await reducirFoto(archivo);
  const habia=Object.prototype.hasOwnProperty.call(m,"foto"), anterior=m.foto;
  m.foto=nueva;
  try{ await saveRoster(); }
  catch(e){
    if(habia) m.foto=anterior; else delete m.foto;
    throw new Error("No fue posible guardar la foto en la base central. Revisa tu conexión e inténtalo de nuevo.");
  }
}
/* Reduce de una sola vez las fotos antiguas que superen el límite. */
/* Las fotos viajan dentro de la nómina, que se descarga al abrir la app: mientras más pesen, más tarda en abrir con poca señal.
   Esta herramienta reduce las antiguas. Antes guarda un respaldo de las originales; si una foto está dañada, las demás se arreglan igual. */
async function reducirFotosEnRespaldoDePrueba(){
  /* En modo prueba la app guarda una copia de la nómina para «Restaurar pruebas», y esa copia se descarga en CADA guardado. */
  const base=await sGet(TEST_BASELINE_KEY,null);
  if(!base||!Array.isArray(base[ROSTER_KEY])) return 0;
  let n=0;
  for(const x of base[ROSTER_KEY]){
    if(typeof x.foto==="string"&&x.foto.startsWith("data:")&&bytesDeDataUrl(x.foto)>FOTO_MAX_BYTES){
      try{ x.foto=await reducirFoto(x.foto); n++; }catch(e){}
    }
  }
  if(n) await rawSet(TEST_BASELINE_KEY,base);
  return n;
}
async function optimizarFotosExistentes(){
  const msg=document.getElementById("fotosOptimizarMsg"); if(!msg) return;
  msg.classList.remove("err");
  const maxKb=Math.round(FOTO_MAX_BYTES/1024);
  const pesadas=ROSTER.filter(m=>typeof m.foto==="string"&&m.foto.startsWith("data:")&&bytesDeDataUrl(m.foto)>FOTO_MAX_BYTES);
  if(!pesadas.length){
    /* Si alguna escritura simultánea dejó pesada la copia de «modo prueba», volver a presionar el botón la aligera */
    let extra=""; try{ const n=await reducirFotosEnRespaldoDePrueba(); if(n) extra=" Se aligeró la copia de «modo prueba» ("+n+" foto(s))."; }catch(e){}
    msg.textContent="Todas las fotografías ya están dentro del límite ("+maxKb+" KB)."+extra; return;
  }
  const antes=pesadas.reduce((t,m)=>t+bytesDeDataUrl(m.foto),0);
  if(!confirm("Se reducirán "+pesadas.length+" fotografía(s) ("+Math.round(antes/1024)+" KB) a "+FOTO_LADO_PX+" x "+FOTO_LADO_PX+" px y máximo "+maxKb+" KB. Antes se guarda un respaldo de las fotos originales. ¿Continuar?")) return;
  const btn=document.getElementById("fotosOptimizarBtn"); if(btn) btn.disabled=true;
  const originales=new Map(pesadas.map(m=>[m.id,m.foto]));
  try{
    /* 1) Respaldo de las originales: si no se puede guardar, no se toca nada */
    const clave="fotos:respaldo:"+todayISO();
    const respaldo=Object.assign({},await sGet(clave,{}));
    pesadas.forEach(m=>{ if(!respaldo[m.id]) respaldo[m.id]=originales.get(m.id); });
    if(!(await sSet(clave,respaldo))) throw new Error("No se pudo guardar el respaldo de las fotos originales.");
    /* 2) Reducir una por una */
    const fallidas=[]; let hechas=0;
    for(const m of pesadas){
      msg.textContent="Reduciendo fotografías… "+(hechas+fallidas.length+1)+" de "+pesadas.length;
      try{ m.foto=await reducirFoto(originales.get(m.id)); hechas++; }
      catch(e){ m.foto=originales.get(m.id); fallidas.push(nombreCompleto(m)); }
    }
    if(!hechas) throw new Error("Ninguna foto se pudo reducir"+(fallidas.length?": "+fallidas.join(", "):"")+".");
    await saveRoster();
    const despues=pesadas.reduce((t,m)=>t+bytesDeDataUrl(m.foto),0);
    /* La copia de «modo prueba» se verifica después de aligerarla: otro guardado simultáneo podría pisarla con su versión antigua */
    let extra=""; try{
      let primero=0;
      for(let pasada=0;pasada<4;pasada++){ const n=await reducirFotosEnRespaldoDePrueba(); if(!pasada) primero=n; if(!n) break; await new Promise(r=>setTimeout(r,400)); }
      if(primero) extra=" También se aligeró la copia de «modo prueba» ("+primero+" foto(s)).";
    }catch(e){ console.warn("No se pudo aligerar la copia de modo prueba",e); }
    msg.textContent="Listo: "+hechas+" fotografía(s) reducida(s) de "+Math.round(antes/1024)+" KB a "+Math.round(despues/1024)+" KB. Las originales quedaron respaldadas."+extra+(fallidas.length?" No se pudieron procesar: "+fallidas.join(", ")+".":"");
    await renderHvFoto(); await renderDisponibilidad();
  }catch(err){
    pesadas.forEach(m=>{ m.foto=originales.get(m.id); });
    msg.classList.add("err");
    msg.textContent="No se modificó ninguna foto: "+(err&&err.message?err.message:err);
  }finally{ if(btn) btn.disabled=false; }
}
on("fotosOptimizarBtn","click",optimizarFotosExistentes);

on("hvFotoBtn","click",()=>{ if(hvActual()) document.getElementById("hvFotoInput")?.click(); });
on("hvFotoInput","change",async e=>{
  const archivo=e.target.files&&e.target.files[0], m=hvActual(); if(!archivo||!m) return;
  e.target.value="";
  try{
    await guardarFotoVoluntario(m,archivo);
    await renderHvFoto(); await refrescarIdentidadVoluntario(); await renderDisponibilidad();
  }catch(err){ alert((err&&err.message)||"No fue posible guardar la foto."); }
});

function renderHvAnotaciones(){
  const m=hvActual(), box=document.getElementById("hvAnotaciones");
  if(!m){ box.innerHTML=""; return; }
  const an=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha||"")<(b.fecha||"")?1:-1);
  if(!an.length){ box.innerHTML='<div class="empty">Sin antecedentes históricos registrados.</div>'; return; }
  box.innerHTML=an.map(a=>`
    <div class="hist-item">
      <div>
        <div class="hist-date"><span class="badge">${esc(a.tipo||"Antecedente")}</span> ${esc(a.fecha||"sin fecha")}${a.fechaHasta?" → "+esc(a.fechaHasta):""}</div>
        <div class="hist-acto">${esc(a.detalle||"")}</div>
        ${a.institucion?'<div class="foot-note">Institución: '+esc(a.institucion)+'</div>':""}
        ${a.documento?'<div class="foot-note">Respaldo: '+esc(a.documento)+'</div>':""}
        <div class="foot-note">Registrado: ${a.registradoEn?new Date(a.registradoEn).toLocaleString("es-CL"):"registro histórico"}</div>
      </div>
    </div>`).join("");
}

on("hvAgregarBtn","click",async()=>{
  const m=hvActual(); if(!m) return;
  const detalle=document.getElementById("hvDetalle").value.trim();
  if(!detalle) return;
  if(!m.anotaciones) m.anotaciones=[];
  m.anotaciones.push({
    id:uid(), tipo:document.getElementById("hvTipo").value,
    fecha:document.getElementById("hvFecha").value||todayISO(),
    fechaHasta:document.getElementById("hvFechaHasta").value||"",
    institucion:document.getElementById("hvInstitucionEvento").value.trim(),
    documento:document.getElementById("hvDocumento").value.trim(),
    detalle, registradoEn:new Date().toISOString()
  });
  await saveRoster();
  ["hvDetalle","hvFechaHasta","hvInstitucionEvento","hvDocumento"].forEach(id=>document.getElementById(id).value="");
  renderHvAnotaciones();
});

async function renderHvResumen(){
  const m=hvActual(), box=document.getElementById("hvResumen");
  if(!m){ box.innerHTML=""; return; }
  const idx=await getIndex();
  let pres=0,just=0,aus=0;
  for(const it of idx){
    const p=await getParte(it.clave); if(!p||!p.records||!parteCuentaAsistencia(p)) continue;
    if(!voluntarioAplicaParte(p,m.id)) continue;
    const s=p.records[m.id]; if(!s) continue;
    if(s==="presente") pres++; else if(s==="justificado") just++; else aus++;
  }
  const total=pres+just+aus;
  const c=statsCursos(m);
  box.innerHTML=`
    <div class="summary-row">
      <div class="summary-item"><div class="big">${total}</div><div class="lbl">Citaciones registradas</div></div>
      <div class="summary-item"><div class="big">${pres}</div><div class="lbl">Presente</div></div>
      <div class="summary-item"><div class="big">${just}</div><div class="lbl">Justificado</div></div>
      <div class="summary-item"><div class="big">${aus}</div><div class="lbl">Ausente</div></div>
      <div class="summary-item"><div class="big">${total?Math.round(pres/total*100):0}%</div><div class="lbl">Asistencia</div></div>
    </div>
    <div class="summary-row" style="margin-bottom:0;">
      <div class="summary-item"><div class="big">${c.obligOk}/${c.oblig}</div><div class="lbl">Cursos obligatorios</div></div>
      <div class="summary-item"><div class="big">${c.ok}/${c.total}</div><div class="lbl">Total malla ANB</div></div>
    </div>`;
}

async function calcularAsistenciaPorAnio(m){
  const idx=await getIndex();
  const porAnio={};
  for(const it of idx){
    const p=await getParte(it.clave); if(!p||!p.records||!parteCuentaAsistencia(p)) continue;
    if(!voluntarioAplicaParte(p,m.id)) continue;
    const s=p.records[m.id]; if(!s) continue;
    const anio=(it.date||"").slice(0,4); if(!anio) continue;
    if(!porAnio[anio]) porAnio[anio]={pres:0,just:0,aus:0};
    if(s==="presente") porAnio[anio].pres++; else if(s==="justificado") porAnio[anio].just++; else porAnio[anio].aus++;
  }
  return porAnio;
}

async function renderHvAsistenciaAnual(){
  const m=hvActual(), box=document.getElementById("hvAsistenciaAnual");
  if(!m){ box.innerHTML=""; return; }
  const porAnio=await calcularAsistenciaPorAnio(m);
  const anios=Object.keys(porAnio).sort((a,b)=>b-a);
  if(!anios.length){ box.innerHTML='<div class="empty">Sin citaciones registradas.</div>'; return; }
  box.innerHTML='<table><thead><tr><th>Año</th><th>Presente</th><th>Justificado</th><th>Ausente</th><th>Asistencia</th></tr></thead><tbody>'+
    anios.map(a=>{const v=porAnio[a];const total=v.pres+v.just+v.aus;const pct=total?Math.round(v.pres/total*100):0;
      return `<tr><td>${esc(a)}</td><td>${v.pres}</td><td>${v.just}</td><td>${v.aus}</td><td>${pct}%</td></tr>`;
    }).join('')+'</tbody></table>';
}

const PREMIO_TIERS=[5,10,15,20,25,30,35,40];
on("premioAsistenciaGuardarBtn","click",async()=>{
  const v=Math.max(0,Math.min(100,Number(document.getElementById("premioAsistenciaMinima").value)||0));
  await sSet("premioAsistenciaMinima",v);
  renderHvPremios();
});
async function renderHvPremios(){
  const m=hvActual(), box=document.getElementById("hvPremios");
  const minimo=await sGet("premioAsistenciaMinima",75);
  document.getElementById("premioAsistenciaMinima").value=minimo;
  if(!m){ box.innerHTML=""; return; }
  if(!m.fechaIngreso){ box.innerHTML='<div class="empty">Sin fecha de ingreso registrada — no se puede calcular antigüedad.</div>'; return; }
  const ingreso=new Date(m.fechaIngreso+"T12:00:00"), hoy=new Date();
  const aniosCumplidos=Math.floor((hoy-ingreso)/(365.25*86400000));
  const idx=await getIndex(); let pres=0,total=0;
  for(const it of idx){ const p=await getParte(it.clave); if(!p||!p.records) continue; const s=p.records[m.id]; if(!s) continue; total++; if(s==="presente") pres++; }
  const pct=total?Math.round(pres/total*100):0;
  const cumpleAsistencia=pct>=minimo;
  box.innerHTML=`<div class="summary-row"><div class="summary-item"><div class="big">${aniosCumplidos}</div><div class="lbl">Años de servicio</div></div>
    <div class="summary-item"><div class="big">${pct}%</div><div class="lbl">Asistencia histórica</div></div></div>`+
    '<table><thead><tr><th>Premio</th><th>Estado</th></tr></thead><tbody>'+
    PREMIO_TIERS.map(t=>{
      const alcanzado=aniosCumplidos>=t;
      const estado=!alcanzado ? `Pendiente (faltan ${t-aniosCumplidos} años)`
        : cumpleAsistencia ? "Años cumplidos — cumple asistencia ✅"
        : `Años cumplidos, pero asistencia bajo el mínimo (${pct}% &lt; ${minimo}%) ⚠️`;
      return `<tr><td>${t} años</td><td>${estado}</td></tr>`;
    }).join('')+'</tbody></table>';
}

on("premiosCalcularBtn","click",async()=>{
  const box=document.getElementById("premiosAlertaBox");
  box.innerHTML="Calculando…";
  const minimo=await sGet("premioAsistenciaMinima",75);
  const idx=await getIndex();
  // Cargar todos los partes una sola vez, no por persona
  const partes=[];
  for(const it of idx){ const p=await getParte(it.clave); if(p&&p.records) partes.push(p.records); }
  const hoy=new Date();
  const filas=sortedRoster(false).filter(m=>m.fechaIngreso).map(m=>{
    const ingreso=new Date(m.fechaIngreso+"T12:00:00");
    const aniosCumplidos=Math.floor((hoy-ingreso)/(365.25*86400000));
    let pres=0,total=0;
    partes.forEach(r=>{ const s=r[m.id]; if(!s) return; total++; if(s==="presente") pres++; });
    const pct=total?Math.round(pres/total*100):0;
    const proximo=PREMIO_TIERS.find(t=>t>aniosCumplidos);
    const faltan=proximo?proximo-aniosCumplidos:null;
    const yaEsFundador=m.fechaIngreso&&m.fechaIngreso<="2025-11-05"; // ya integraba la Compañía a esa fecha (directo o por traslado)
    return{m,aniosCumplidos,pct,proximo,faltan,yaEsFundador,cumpleAsistencia:pct>=minimo};
  }).sort((a,b)=>(a.faltan??999)-(b.faltan??999));
  if(!filas.length){ box.innerHTML='<div class="empty">Nadie tiene fecha de ingreso registrada todavía.</div>'; return; }
  box.innerHTML='<table><thead><tr><th>Integrante</th><th>Años</th><th>Próximo premio</th><th>Asistencia</th><th>Estado</th></tr></thead><tbody>'+
    filas.map(f=>{
      const alerta = f.faltan!==null && f.faltan<=1;
      const estado = f.faltan===null ? "Superó el tramo máximo"
        : !alerta ? `Faltan ${f.faltan} años`
        : f.cumpleAsistencia ? `<b style="color:#c9a227;">¡Cumple este año! ✅</b>`
        : `Cumple años, pero asistencia insuficiente (${f.pct}% &lt; ${minimo}%) ⚠️`;
      return `<tr style="${alerta?'background:#241c08;':''}"><td>${esc(nombreCompleto(f.m))}${f.yaEsFundador?' <span class="badge">Fundador</span>':''}</td><td>${f.aniosCumplidos}</td><td>${f.proximo?f.proximo+" años":"—"}</td><td>${f.pct}%</td><td>${estado}</td></tr>`;
    }).join('')+'</tbody></table>';
});

function renderHoja(){
  renderHvInstitucional(); renderHvDatos(); renderHvFoto(); renderHvAnotaciones(); renderHvResumen(); renderHvPremios(); renderHvAsistenciaAnual();
}
on("hvMiembro","change",renderHoja);

on("hvTransferenciaPdfBtn","click",async()=>{
  const m=hvActual(); if(!m) return;
  const destino=document.getElementById("hvDestino").value.trim();
  const autoriza=document.getElementById("hvAutorizaTransferencia").value.trim();
  if(!destino||!autoriza){ alert("Indica la institución destinataria y quién autoriza la generación."); return; }
  const {jsPDF}=window.jspdf, doc=new jsPDF();
  pdfHeader(doc,"COPIA DE ANTECEDENTES BOMBERILES");
  let y=38; doc.setFontSize(11); doc.setFont("helvetica","bold"); doc.text(nombreCompleto(m),14,y);
  doc.setFont("helvetica","normal"); doc.setFontSize(9); y+=6;
  doc.text("RUT: "+(m.rut||"—")+" · Clave: "+(m.clave||"—"),14,y); y+=5;
  doc.text("Destino: "+destino,14,y); y+=5; doc.text("Autorizado por: "+autoriza,14,y); y+=7;
  const an=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha||"").localeCompare(b.fecha||""));
  doc.autoTable({startY:y,styles:{fontSize:7.5},headStyles:{fillColor:[179,36,28]},
    head:[["Desde","Hasta","Tipo","Institución","Antecedente","Respaldo"]],
    body:an.map(a=>[a.fecha||"—",a.fechaHasta||"—",a.tipo||"—",a.institucion||"—",a.detalle||"—",a.documento||"—"])});
  const obs=document.getElementById("hvObsTransferencia").value.trim();
  if(obs){ const yy=doc.lastAutoTable.finalY+7; doc.setFontSize(8); doc.text("Observación: "+obs,14,yy,{maxWidth:180}); }
  const log=m.transferencias||[]; log.push({fecha:new Date().toISOString(),destino,autoriza,observacion:obs}); m.transferencias=log; await saveRoster();
  doc.save("Antecedentes_"+slug(nombreCompleto(m))+".pdf");
});

on("hvPdfBtn","click",async()=>{
  const m=hvActual(); if(!m) return;
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"HOJA DE VIDA DEL VOLUNTARIO");
  let y=38;
  doc.setFont("helvetica","bold"); doc.setFontSize(12);
  doc.text(`N° ${m.n} · ${nombreCompleto(m)}`,14,y); y+=4;

  doc.autoTable({
    startY:y+2, styles:{fontSize:9}, headStyles:{fillColor:[179,36,28]},
    head:[["Antecedentes institucionales",""]],
    body:[
      ["Clave radial",m.clave||"—"],["RUT",m.rut||"—"],["Cargo actual",m.cargo||"—"],["Conductor de unidad",m.conductor?"Sí":"No"],["Calidad",m.categoria||"—"],
      ["Fecha de ingreso",m.fechaIngreso||"—"],["Forma de ingreso",m.formaIngreso||"—"],
      ["Procedencia",m.origen||"—"],["Especialidad",m.especialidad||"—"],
      ["Situación", m.activo===false?`Dado de baja (${m.motivoBaja||"sin motivo"})`:"Activo"]
    ]
  });

  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[100,90,80]},
    head:[["Datos personales",""]],
    body:[
      ["Fecha de nacimiento",m.fechaNacimiento||"—"],["Estado civil",m.estadoCivil||"—"],
      ["Profesión u oficio",m.profesion||"—"],["Teléfono",m.telefono||"—"],
      ["Correo",m.email||"—"],["Dirección",m.direccion||"—"],
      ["Grupo sanguíneo",m.grupoSanguineo||"—"],["Alergias / condiciones",m.alergias||"—"],
      ["Contacto de emergencia",[m.emergenciaNombre,m.emergenciaTelefono,m.emergenciaRelacion].filter(Boolean).join(" · ")||"—"]
    ]
  });

  const an=(m.anotaciones||[]).slice().sort((a,b)=>(a.fecha||"")<(b.fecha||"")?1:-1);
  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[179,36,28]},
    head:[["Fecha","Tipo","Detalle"]],
    body: an.length ? an.map(a=>[a.fecha||"—",a.tipo,a.detalle]) : [["—","—","Sin anotaciones registradas"]]
  });

  const idx=await getIndex();
  let pres=0,just=0,aus=0;
  for(const it of idx){
    const p=await getParte(it.clave); if(!p||!p.records) continue;
    const s=p.records[m.id]; if(!s) continue;
    if(s==="presente") pres++; else if(s==="justificado") just++; else aus++;
  }
  const total=pres+just+aus, c=statsCursos(m);
  doc.autoTable({
    startY:doc.lastAutoTable.finalY+6, styles:{fontSize:9}, headStyles:{fillColor:[100,90,80]},
    head:[["Resumen de servicio",""]],
    body:[
      ["Citaciones registradas",String(total)],
      ["Presente / Justificado / Ausente",`${pres} / ${just} / ${aus}`],
      ["Porcentaje de asistencia",(total?Math.round(pres/total*100):0)+"%"],
      ["Cursos obligatorios",`${c.obligOk} de ${c.oblig}`],
      ["Avance malla ANB",`${c.ok} de ${c.total}`]
    ]
  });

  let fy=doc.lastAutoTable.finalY+18;
  if(fy>250){ doc.addPage(); fy=40; }
  doc.setFontSize(9);
  doc.line(20,fy,85,fy); doc.text("Secretario",20,fy+5);
  doc.line(115,fy,180,fy); doc.text("Director",115,fy+5);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,fy+18);

  await sharePdfDoc(doc,`hoja_de_vida_${m.n}_${slug(nombreCompleto(m))}.pdf`,`Hoja de vida - ${nombreCompleto(m)}`);
});

/* ============ BAJAS ============ */
on("ordenModo","change",async()=>{
  ORDEN_MODO=document.getElementById("ordenModo").value;
  await sSet("orden:v1",ORDEN_MODO);
  refrescarTodo();
});

function renderBajasSelects(){
  const act=document.getElementById("bajaMiembro"), bor=document.getElementById("borrarMiembro");
  if(!act||!bor) return;
  const todos=sortedRoster(true);
  const vacio='<option value="">— seleccionar integrante —</option>';
  act.innerHTML = vacio + todos.map(p=>`<option value="${p.id}">${p.n?"N°"+p.n+" — ":""}${esc(nombreCompleto(p))}${p.activo===false?" (dado de baja)":""}</option>`).join("");
  bor.innerHTML = vacio + todos.map(p=>`<option value="${p.id}">${p.n?"N°"+p.n+" — ":""}${esc(nombreCompleto(p))} — ${esc(p.cargo)}</option>`).join("");
  act.value=""; bor.value="";
}

/* ---- Acceso restringido a la oficialidad ---- */
let bajasDesbloqueado=false;

async function autenticarOficialidad(pin){
  if(MODO_PRUEBA_ABIERTO) return {ok:true};
  try{
    const r=await fetch("/api/auth/officiality",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin})});
    if(r.ok) return {ok:true};
    if(r.status===503) return {ok:false,motivo:"no_configurado"};
    return {ok:false,motivo:"clave_incorrecta"};
  }catch(e){ return {ok:false,motivo:"conexion"}; }
}
function mensajeOficialidad(motivo){
  if(motivo==="no_configurado") return "El sistema de acceso no está configurado (falta clave inicial en el servidor). Avisa al encargado técnico.";
  if(motivo==="conexion") return "No fue posible conectar. Verifica tu conexión e inténtalo de nuevo.";
  return "Clave incorrecta.";
}
const MODO_PRUEBA_ABIERTO=true;
function pintarCandado(){
  const cand=document.getElementById("configCandado"), cont=document.getElementById("configContenido");
  if(!cand||!cont) return;
  if(MODO_PRUEBA_ABIERTO){
    cand.style.display="none";
    cont.style.display="block";
    return;
  }
  cand.style.display = bajasDesbloqueado ? "none" : "block";
  cont.style.display = bajasDesbloqueado ? "block" : "none";
}
on("bajaEntrarBtn","click",async()=>{
  const inp=document.getElementById("bajaClave"), msg=document.getElementById("bajaClaveMsg");
  const res = await autenticarOficialidad(inp.value.trim());
  msg.classList.toggle("err",!res.ok);
  if(res.ok){
    bajasDesbloqueado=true; inp.value=""; msg.textContent="";
    pintarCandado(); renderBajasSelects(); renderBajasList(); renderAlertas();
  } else {
    msg.textContent=mensajeOficialidad(res.motivo);
    inp.value="";
  }
});
on("bajaClave","keydown",e=>{ if(e.key==="Enter") document.getElementById("bajaEntrarBtn").click(); });
on("bajaSalirBtn","click",async()=>{
  try{ await fetch("/api/auth/officiality",{method:"DELETE"}); }catch(e){}
  bajasDesbloqueado=false; pintarCandado();
});
on("bajaCambiarClaveBtn","click",async()=>{
  const nueva=prompt("Nueva clave de Oficialidad (4 a 12 dígitos):");
  if(nueva===null) return;
  if(!/^\d{4,12}$/.test(nueva)){ alert("La clave debe tener entre 4 y 12 dígitos."); return; }
  const confirma=prompt("Repita la nueva clave:");
  if(confirma!==nueva){ alert("Las claves no coinciden."); return; }
  try{
    const r=await fetch("/api/auth/officiality/change",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({pin:nueva})});
    if(!r.ok) throw new Error("change_failed");
    alert("Clave de Oficialidad actualizada.");
  }catch(e){ alert("No fue posible cambiar la clave. Verifique la conexión e inténtelo nuevamente."); }
});
function renderBajasList(){
  const box=document.getElementById("bajasList");
  const bajas=ROSTER.filter(m=>m.activo===false);
  if(!bajas.length){ box.innerHTML='<div class="empty">No hay integrantes dados de baja.</div>'; return; }
  box.innerHTML = bajas.map(m=>`
    <div class="hist-item">
      <div>
        <div class="hist-date"><span class="ac">N° ${m.n||"—"}</span> ${esc(nombreCompleto(m))}</div>
        <div class="hist-acto">${esc(m.motivoBaja||"Sin motivo registrado")}${m.fechaBaja?" · "+esc(m.fechaBaja):""}${m.obsBaja?" · "+esc(m.obsBaja):""}</div>
      </div>
      <div class="hist-right"><span class="badge pend">N° retirado</span></div>
    </div>`).join("")
    + `<div class="foot-note">Al dar de baja a un integrante, la numeración se corre: los que siguen suben un lugar en la lista.</div>`;
}
on("darBajaBtn","click",async()=>{
  const id=document.getElementById("bajaMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("bajaMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  if(!confirm(`¿Dar de baja a ${nombreCompleto(m)}?\n\nDejará de aparecer al pasar lista, pero se conserva su historial.`)) return;
  m.activo=false;
  m.motivoBaja=document.getElementById("bajaMotivo").value;
  m.fechaBaja=document.getElementById("bajaFecha").value||todayISO();
  m.obsBaja=document.getElementById("bajaObs").value.trim();
  if(!m.anotaciones) m.anotaciones=[];
  m.anotaciones.push({id:uid(),tipo:m.motivoBaja||"Retiro/baja",fecha:m.fechaBaja,institucion:"5ª Compañía Germania",detalle:m.obsBaja||m.motivoBaja||"Baja registrada",registradoEn:new Date().toISOString()});
  await renumerarYGuardar();
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue dado de baja (${m.motivoBaja}).`;
  document.getElementById("bajaObs").value="";
  refrescarTodo();
});
on("reactivarBtn","click",async()=>{
  const id=document.getElementById("bajaMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("bajaMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  const bajaAnterior={motivo:m.motivoBaja||"",fecha:m.fechaBaja||"",obs:m.obsBaja||""};
  m.activo=true;
  if(!m.anotaciones) m.anotaciones=[];
  m.anotaciones.push({id:uid(),tipo:"Reincorporación",fecha:todayISO(),institucion:"5ª Compañía Germania",detalle:bajaAnterior.motivo?`Reincorporación posterior a ${bajaAnterior.motivo}`:"Reincorporación",registradoEn:new Date().toISOString()});
  // El estado vigente se limpia, pero el antecedente histórico permanece en anotaciones.
  delete m.motivoBaja; delete m.fechaBaja; delete m.obsBaja;
  await renumerarYGuardar();
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue reactivado y vuelve a aparecer al pasar lista.`;
  refrescarTodo();
});
on("borrarMiembroBtn","click",async()=>{
  const id=document.getElementById("borrarMiembro").value;
  const m=id?ROSTER.find(x=>x.id===id):null;
  const msg=document.getElementById("borrarMsg");
  if(!m){ msg.textContent="Primero selecciona un integrante de la lista."; msg.classList.add("err"); return; }
  const capitan=document.getElementById("borrarValCapitan")?.checked;
  const secretario=document.getElementById("borrarValSecretario")?.checked;
  const ayudante=document.getElementById("borrarValAyudante")?.checked;
  if(!(capitan&&secretario&&ayudante)){
    msg.textContent="La eliminación definitiva requiere validación conjunta de Capitán, Secretario y Ayudante.";
    msg.classList.add("err"); return;
  }
  if(!confirm(`¿Eliminar definitivamente a ${nombreCompleto(m)}?\n\nConfirmas que es un registro creado por error y que Capitán, Secretario y Ayudante validaron esta eliminación. Una baja, renuncia o traslado NO debe eliminarse.`)) return;
  const auditoria=await sGet("auditoria:eliminaciones:v1",[]);
  auditoria.push({fecha:new Date().toISOString(),voluntarioId:m.id,nombre:nombreCompleto(m),motivo:"Registro creado por error",validaciones:["Capitán","Secretario","Ayudante"]});
  await sSet("auditoria:eliminaciones:v1",auditoria);
  ROSTER=ROSTER.filter(x=>x.id!==id);
  await renumerarYGuardar();
  ["borrarValCapitan","borrarValSecretario","borrarValAyudante"].forEach(x=>{const el=document.getElementById(x);if(el)el.checked=false;});
  msg.classList.remove("err");
  msg.textContent=`${nombreCompleto(m)} fue eliminado tras la triple validación. La autorización quedó registrada en auditoría.`;
  refrescarTodo();
});

function refrescarTodo(){
  renderListaRows(); renderRegistradoPorOptions(); renderCfgRoster();
  renderCursoMiembroSelect(); renderCursos(); renderCursosCompania();
  renderBajasSelects(); renderBajasList();
  renderHvSelect(); renderHoja(); renderBuscadorOpciones();
}

/* ============ CURSOS ============ */
function renderCursoMiembroSelect(){
  const sel=document.getElementById("cursoMiembro"), cur=sel.value;
  sel.innerHTML=sortedRoster(true).map(p=>`<option value="${p.id}">${esc(nombreCompleto(p))} — ${esc(p.cargo)}</option>`).join("");
  if(cur && ROSTER.find(m=>m.id===cur)) sel.value=cur;
}
function cursoState(m,curso){ return (m.cursos&&m.cursos[curso])||null; }
function statsCursos(m){
  let oblig=0,obligOk=0,total=0,ok=0;
  MALLA.forEach(g=>g.cursos.forEach(c=>{
    total++; const done=!!cursoState(m,c); if(done) ok++;
    if(NIVELES_OBLIGATORIOS.includes(g.nivel)){ oblig++; if(done) obligOk++; }
  }));
  return {oblig,obligOk,total,ok};
}
function renderCursos(){
  const id=document.getElementById("cursoMiembro").value;
  const m=ROSTER.find(x=>x.id===id);
  const box=document.getElementById("cursosLista"), res=document.getElementById("cursosResumen");
  if(!m){ box.innerHTML='<div class="empty">Selecciona un integrante.</div>'; res.innerHTML=""; return; }
  const s=statsCursos(m);
  res.innerHTML=`<div class="summary-item"><div class="big">${s.obligOk}/${s.oblig}</div><div class="lbl">Cursos obligatorios (inicial a intermedio)</div></div>
    <div class="summary-item"><div class="big">${s.oblig-s.obligOk}</div><div class="lbl">Obligatorios pendientes</div></div>
    <div class="summary-item"><div class="big">${s.ok}/${s.total}</div><div class="lbl">Total malla</div></div>`;
  box.innerHTML="";
  MALLA.forEach(g=>{
    const done=g.cursos.filter(c=>cursoState(m,c)).length;
    const head=document.createElement("div"); head.className="nivel-head";
    head.innerHTML=`<h3>${esc(g.nivel)}</h3><span class="badge ${done===g.cursos.length?'ok':'pend'}">${done}/${g.cursos.length}</span>`;
    box.appendChild(head);
    g.cursos.forEach(c=>{
      const st=cursoState(m,c);
      const row=document.createElement("div"); row.className="curso-row";
      row.innerHTML=`<input type="checkbox" data-curso="${esc(c)}" ${st?"checked":""}>
        <span class="cname">${esc(c)}</span>
        <input type="date" data-fecha="${esc(c)}" value="${st&&st.fecha?st.fecha:""}" ${st?"":"disabled"} title="Fecha de aprobación">`;
      const chk=row.querySelector("[data-curso]"), fch=row.querySelector("[data-fecha]");
      chk.addEventListener("change",async()=>{
        if(chk.checked){ m.cursos[c]={fecha:fch.value||""}; fch.disabled=false; }
        else { delete m.cursos[c]; fch.value=""; fch.disabled=true; }
        await saveRoster(); renderCursos(); renderCursosCompania();
      });
      fch.addEventListener("change",async()=>{
        if(m.cursos[c]){ m.cursos[c].fecha=fch.value; await saveRoster(); }
      });
      box.appendChild(row);
    });
  });
}
on("cursoMiembro","change",renderCursos);

function renderCursosCompania(){
  const box=document.getElementById("cursosCompania");
  const list=sortedRoster(true);
  if(!list.length){ box.innerHTML='<div class="empty">Sin integrantes.</div>'; return; }
  let html='<table><thead><tr><th>Nombre</th><th>Calidad</th><th>Obligatorios</th><th>Pendientes</th></tr></thead><tbody>';
  list.forEach(m=>{
    const s=statsCursos(m), pend=s.oblig-s.obligOk;
    html+=`<tr><td class="name-col">${esc(nombreCompleto(m))}</td><td class="cargo-col">${esc(m.categoria||"")}</td>
      <td>${s.obligOk}/${s.oblig}</td>
      <td><span class="badge ${pend===0?'ok':'pend'}">${pend===0?"Al día":pend+" pendientes"}</span></td></tr>`;
  });
  box.innerHTML=html+"</tbody></table>";
}
on("cursosPdfBtn","click",async()=>{
  const {jsPDF}=window.jspdf; const doc=new jsPDF();
  pdfHeader(doc,"CONTROL DE CURSOS · MALLA ANB 2025-2028");
  const rows=[];
  sortedRoster(false).forEach(m=>{
    const s=statsCursos(m);
    rows.push([nombreCompleto(m),m.categoria||"",`${s.obligOk}/${s.oblig}`,(s.oblig-s.obligOk)===0?"Al día":(s.oblig-s.obligOk)+" pendientes"]);
  });
  doc.autoTable({head:[["Nombre","Calidad","Obligatorios","Estado"]],body:rows,startY:32,styles:{fontSize:9},headStyles:{fillColor:[179,36,28]}});
  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleString("es-CL")}`,14,doc.lastAutoTable.finalY+10);
  await sharePdfDoc(doc,`cursos_quinta_compania_${todayISO()}.pdf`,'Control de cursos - Quinta Compañía "Germania"');
});

/* ============ TIPOS ============ */
function renderTiposTags(){
  const box=document.getElementById("tiposTags");
  box.innerHTML=TIPOS.map(t=>`<span class="tag">${esc(t)} <button data-del-tipo="${esc(t)}" title="Quitar">×</button></span>`).join("");
  box.querySelectorAll("[data-del-tipo]").forEach(b=>b.addEventListener("click",async()=>{
    if(TIPOS.length<=1) return;
    TIPOS=TIPOS.filter(t=>t!==b.dataset.delTipo);
    await saveTipos(); renderTiposTags(); renderTipoSelect(); populateTipoFilters();
  }));
}
on("agregarTipoBtn","click",async()=>{
  const inp=document.getElementById("nuevoTipoInput"), v=inp.value.trim();
  if(!v||TIPOS.includes(v)) return;
  TIPOS.push(v); await saveTipos(); inp.value="";
  renderTiposTags(); renderTipoSelect(); populateTipoFilters();
});

/* ============ IMPORTAR DATOS ============ */
const IMPORT_KEY="importado:2026";

function normaliza(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z ]/g,"").trim();
}
/* Empareja a cada persona de la planilla con su ficha en la nómina */
function emparejar(persona){
  const ap=normaliza(persona.ap), nom=normaliza(persona.nom).split(" ")[0];
  let m=ROSTER.find(x=>normaliza(x.apellidoPaterno)===ap && normaliza(x.nombre).split(" ")[0]===nom);
  if(!m) m=ROSTER.find(x=>normaliza(x.apellidoPaterno)===ap);
  return m||null;
}

async function estadoImportacion(){
  const box=document.getElementById("impEstado");
  const ya=await sGet(IMPORT_KEY,null);
  const sinFicha=HISTORICO_2026.gente.filter(p=>!emparejar(p));
  box.innerHTML=`
    <div class="summary-row" style="margin-bottom:10px;">
      <div class="summary-item"><div class="big">${HISTORICO_2026.acts.length}</div><div class="lbl">Actividades en la planilla</div></div>
      <div class="summary-item"><div class="big">${HISTORICO_2026.gente.length-sinFicha.length}/${HISTORICO_2026.gente.length}</div><div class="lbl">Personas reconocidas en la nómina</div></div>
      <div class="summary-item"><div class="big">${ya?"Sí":"No"}</div><div class="lbl">Ya fue importado</div></div>
    </div>
    ${sinFicha.length?`<div class="aviso">Sin ficha en la nómina: ${sinFicha.map(p=>esc(p.nom+" "+p.ap)).join(", ")}. Su asistencia no se cargará.</div>`:""}`;
}

async function importarHistorico2026(){
  const mapa=HISTORICO_2026.gente.map(emparejar);
  const idx=await getIndex();
  const existentes=(await Promise.allSettled(idx.map(it=>getParte(it.clave))))
    .filter(x=>x.status==="fulfilled"&&x.value).map(x=>x.value);
  const firmasId=new Set(existentes.map(firmaParteImportado).filter(Boolean));
  // Compatibilidad con el histórico cargado antes de existir importId:
  // se consume como máximo una coincidencia antigua por cada fila de la fuente.
  const legacyDisponibles=new Map();
  existentes.filter(p=>p.importado&&!p.importId).forEach(p=>{
    const f=firmaContenidoParteImportado(p);
    legacyDisponibles.set(f,(legacyDisponibles.get(f)||0)+1);
  });
  let creadas=0, omitidas=0;
  for(const [orden,a] of HISTORICO_2026.acts.entries()){
    const tipo=a.t;
    if(!TIPOS.includes(tipo)){ TIPOS.push(tipo); }
    const records={};
    ROSTER.forEach(m=>{ records[m.id]="ausente"; });
    mapa.forEach((m,i)=>{ if(m && a.m[i]==="A") records[m.id]="presente"; });
    const importId="historico-2026:"+String(orden+1).padStart(3,"0");
    const parte={date:a.f,tipo,detalle:a.n,registradoPor:"",records,importado:true,importId,importFuente:"FÜNFTE ASISTENCIAS 2026 CBV.xlsx"};
    const firmaId=firmaParteImportado(parte);
    if(firmasId.has(firmaId)){ omitidas++; continue; }
    const legacy=firmaContenidoParteImportado(parte), disponibles=legacyDisponibles.get(legacy)||0;
    if(disponibles>0){ legacyDisponibles.set(legacy,disponibles-1); omitidas++; continue; }
    const k=await claveNueva(a.f,tipo);
    await setParte(k,parte);
    firmasId.add(firmaId);
    creadas++;
  }
  await saveTipos(); renderTipoSelect(); populateTipoFilters();
  await sSet(IMPORT_KEY,{fecha:todayISO(),actividades:HISTORICO_2026.acts.length,nuevas:creadas,existentes:omitidas});
  return creadas;
}
on("impCargarBtn","click",async()=>{
  const msg=document.getElementById("impMsg");
  const creadas=await importarHistorico2026();
  msg.classList.remove("err");
  msg.textContent=`Se importaron ${creadas} actividades. Ya puedes ver el panel del año 2026.`;
  estadoImportacion();
});
on("pnCargarHist","click",async()=>{
  const b=document.getElementById("pnCargarHist");
  b.disabled=true; b.textContent="Cargando…";
  const creadas=await importarHistorico2026();
  b.disabled=false; b.textContent="Cargar histórico 2026";
  alert(`Se importaron ${creadas} actividades de 2026.`);
  await renderPanel();
});

on("impBorrarBtn","click",async()=>{
  if(!confirm("¿Borrar las actividades importadas desde la planilla? Los partes que hayas registrado a mano no se tocan.")) return;
  const idx=await getIndex();
  const quedan=[];
  for(const it of idx){
    const p=await getParte(it.clave);
    if(p&&p.importado){ await sSet("parte:"+it.clave,null); }
    else quedan.push(it);
  }
  await sSet(INDEX_KEY,quedan);
  await sSet(IMPORT_KEY,null);
  document.getElementById("impMsg").textContent="Actividades importadas eliminadas.";
  document.getElementById("impMsg").classList.remove("err");
  estadoImportacion();
});

/* --- CSV --- */
on("impArchivo","change",async(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const msg=document.getElementById("impCsvMsg");
  try{
    const texto=await f.text();
    const lineas=texto.split(/\r?\n/).filter(l=>l.trim());
    let n=0, errores=[];
    for(const [i,linea] of lineas.entries()){
      const c=linea.split(";");
      if(c.length<3) continue;
      if(i===0 && /fecha/i.test(c[0])) continue;
      const [fecha,tipo,actividad,asistentes]=c.map(x=>(x||"").trim());
      if(!/^\d{4}-\d{2}-\d{2}$/.test(fecha)){ errores.push("línea "+(i+1)+": fecha inválida"); continue; }
      const ids=(asistentes||"").split(",").map(x=>x.trim()).filter(Boolean);
      const records={};
      ROSTER.forEach(m=>{ records[m.id]="ausente"; });
      ids.forEach(ref=>{
        const m=ROSTER.find(x=>String(x.clave)===ref || String(x.n)===ref);
        if(m) records[m.id]="presente"; else errores.push("línea "+(i+1)+": no se encontró "+ref);
      });
      if(!TIPOS.includes(tipo)) TIPOS.push(tipo);
      const k=await claveNueva(fecha,tipo);
      await setParte(k,{date:fecha,tipo,detalle:actividad,registradoPor:"",records,importado:true,importId:"csv:"+Date.now()+":"+i,importFuente:f.name||"CSV"});
      n++;
    }
    await saveTipos(); renderTipoSelect(); populateTipoFilters();
    msg.classList.remove("err");
    msg.textContent=`${n} actividades importadas.`+(errores.length?` Con ${errores.length} advertencia(s): ${errores.slice(0,3).join("; ")}`:"");
  }catch(err){
    msg.classList.add("err"); msg.textContent="No se pudo leer el archivo.";
  }
  e.target.value="";
});

/* --- RESPALDO --- */
on("impExportarBtn","click",async()=>{
  const idx=await getIndex();
  const partes={};
  for(const it of idx){ partes[it.clave]=await getParte(it.clave); }
  const respaldo={version:1, fecha:new Date().toISOString(),
    roster:ROSTER, tipos:TIPOS, cargos:CARGOS, orden:ORDEN_MODO, indice:idx, partes};
  const blob=new Blob([JSON.stringify(respaldo)],{type:"application/json"});
  await entregarArchivo(blob,`respaldo_quinta_compania_${todayISO()}.json`,"Respaldo","Respaldo generado");
  document.getElementById("impBkMsg").textContent="Respaldo descargado.";
  document.getElementById("impBkMsg").classList.remove("err");
});

on("impRestaurar","change",async(e)=>{
  const f=e.target.files[0]; if(!f) return;
  const msg=document.getElementById("impBkMsg");
  if(!confirm("Restaurar un respaldo reemplaza toda la información actual. ¿Continuar?")){ e.target.value=""; return; }
  try{
    const r=JSON.parse(await f.text());
    if(!r.roster) throw new Error("formato");
    ROSTER=r.roster; TIPOS=r.tipos||TIPOS; CARGOS=r.cargos||CARGOS; ORDEN_MODO=r.orden||ORDEN_MODO;
    await saveRoster(); await saveTipos(); await saveCargos(); await sSet("orden:v1",ORDEN_MODO);
    await sSet(INDEX_KEY, r.indice||[]);
    for(const [clave,parte] of Object.entries(r.partes||{})) await sSet("parte:"+clave,parte);
    renderTipoSelect(); populateTipoFilters(); refrescarTodo();
    msg.classList.remove("err");
    msg.textContent="Respaldo restaurado.";
  }catch(err){
    msg.classList.add("err"); msg.textContent="El archivo no es un respaldo válido.";
  }
  e.target.value="";
});

/* ============ GERMANIA · DISPONIBILIDAD DIARIA ============ */
const DISP_PREF_KEY="germania:mi-voluntario";
const DISP_LABELS={cuartel:"En cuartel",disponible:"Disponible",fuera:"Fuera de Villarrica",no:"No disponible"};

function dispKey(){ return "disponibilidad:"+todayISO(); }
function fotoKey(id){ return "germania:foto:"+id; }
const FOTOS_OFICIALES_POR_RUT={
  "15.243.920-2":"/legacy/voluntarios/karam-puali-lopez.webp",
  "15.590310-4":"/legacy/voluntarios/fernando-jerez-pantoja.webp",
  "20.256.703-7":"/legacy/voluntarios/matias-corvalan-garrido.webp",
  "14.413.688-8":"/legacy/voluntarios/susumu-sugiura-aguilar.webp",
  "8.905.167-3":"/legacy/voluntarios/mathias-von-leyser-jux.webp",
  "10.566.726-4":"/legacy/voluntarios/christian-vergara-sandoval.webp",
  "16.711.219-6":"/legacy/voluntarios/andres-herrera-santander.webp"
};
function fotoVoluntario(p){ return (p&&p.foto)||(p&&FOTOS_OFICIALES_POR_RUT[p.rut])||fotoPlaceholder(); }
function fotoPlaceholder(){
  return "data:image/svg+xml;charset=UTF-8,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#171d22"/><circle cx="50" cy="38" r="19" fill="#ffcc00"/><path d="M18 92c4-24 18-36 32-36s28 12 32 36" fill="#ffcc00"/></svg>');
}
async function refrescarIdentidadVoluntario(){
  const sel=document.getElementById("miVoluntario"), img=document.getElementById("miFoto");
  const nom=document.getElementById("miNombre"), cargo=document.getElementById("miCargo");
  if(!sel||!img||!nom||!cargo) return;
  const p=ROSTER.find(x=>String(x.id)===String(sel.value));
  if(!p){ nom.textContent="Voluntario"; cargo.textContent="Selecciona tu nombre"; img.src=fotoPlaceholder(); return; }
  nom.textContent=nombreCompleto(p);
  cargo.textContent=(p.cargo&&p.cargo!=="Voluntario"?p.cargo+" · ":"")+"Voluntario activo";
  if(!p.foto){
    const anterior=await sGet(fotoKey(p.id),null);
    if(anterior){ p.foto=anterior; await saveRoster(); }
  }
  img.src=fotoVoluntario(p);
}
const DEVICE_VOLUNTARIO_KEY="germania:voluntario-dispositivo:v2";
function guardarVoluntarioDispositivo(p){
  if(!p) return;
  const dato={id:String(p.id||""),clave:String(p.clave||""),rut:String(p.rut||"")};
  try{ localStorage.setItem(DEVICE_VOLUNTARIO_KEY,JSON.stringify(dato)); }catch(e){ console.warn("No se pudo guardar identidad local",e); }
  try{ document.cookie="germania_voluntario="+encodeURIComponent(JSON.stringify(dato))+"; Max-Age=31536000; Path=/; SameSite=Lax"; }catch(e){}
}
function leerVoluntarioDispositivo(){
  let dato=null;
  try{ dato=JSON.parse(localStorage.getItem(DEVICE_VOLUNTARIO_KEY)||"null"); }catch(e){}
  if(!dato){
    try{
      const m=document.cookie.match(/(?:^|; )germania_voluntario=([^;]+)/);
      if(m) dato=JSON.parse(decodeURIComponent(m[1]));
    }catch(e){}
  }
  if(!dato) return null;
  return ROSTER.find(p=>p.activo!==false&&(
    (dato.rut&&String(p.rut)===String(dato.rut))||
    (dato.clave&&String(p.clave)===String(dato.clave))||
    (dato.id&&String(p.id)===String(dato.id))
  ))||null;
}
function cargarMiVoluntario(){
  const sel=document.getElementById("miVoluntario"); if(!sel) return;
  sel.innerHTML='<option value="">Seleccionar voluntario…</option>'+sortedRoster(false)
    .map(p=>`<option value="${p.id}">${p.clave?esc(p.clave)+" · ":""}${esc(nombreCompleto(p))}</option>`).join("");
  const guardado=leerVoluntarioDispositivo();
  sel.value=guardado?String(guardado.id):"";
  if(guardado) guardarVoluntarioDispositivo(guardado);
  refrescarIdentidadVoluntario();
}
async function getDisponibilidadHoy(){ return await sGet(dispKey(),{}); }
/* Cada voluntario conserva su último estado HASTA QUE ÉL (o un oficial) lo cambie: no vence a las 24 horas ni a una fecha.
   Se guarda aparte el último estado de cada uno («disponibilidad:vigente») y, además, cada día se sigue guardando como historial.
   Para no depender de un solo registro, también se miran los últimos 14 días y se toma siempre el más reciente. */
const DISP_DIAS_ATRAS=14, DISP_VIGENTE_KEY="disponibilidad:vigente";
let DISP_PREV=null;
function dispMasReciente(a,b){
  if(!a) return b; if(!b) return a;
  return (Date.parse(b.desde)||0)>=(Date.parse(a.desde)||0)?b:a;
}
async function estadosPrevios(){
  const hoy=todayISO();
  if(DISP_PREV&&DISP_PREV.dia===hoy&&Date.now()<DISP_PREV.hasta) return DISP_PREV.mapa;
  const claves=Array.from({length:DISP_DIAS_ATRAS},(_,i)=>"disponibilidad:"+gnAdd(hoy,-(i+1)));
  const [dias,vigente]=await Promise.all([
    Promise.all(claves.map(k=>sGet(k,{}).catch(()=>({})))),
    sGet(DISP_VIGENTE_KEY,{}).catch(()=>({}))
  ]);
  const mapa={};
  const poner=(id,r)=>{ if(r&&r.estado) mapa[id]=dispMasReciente(mapa[id],Object.assign({},r,{arrastrado:true})); };
  dias.forEach(d=>Object.entries(d||{}).forEach(([id,r])=>poner(id,r)));
  Object.entries(vigente||{}).forEach(([id,r])=>poner(id,r));
  DISP_PREV={dia:hoy,hasta:Date.now()+5*60*1000,mapa};
  return mapa;
}
async function getDisponibilidadVigente(){
  const [hoy,prev]=await Promise.all([getDisponibilidadHoy(),estadosPrevios()]);
  const out=Object.assign({},prev);
  Object.entries(hoy||{}).forEach(([id,r])=>{ if(r&&r.estado) out[id]=dispMasReciente(out[id],r); });
  return out;
}
function dispDesdeTexto(r){
  if(!r||!r.desde) return "—";
  const f=new Date(r.desde), hoy=todayISO(), dia=gnISO(f);
  const hora=f.toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});
  if(dia===hoy) return hora;
  if(dia===gnAdd(hoy,-1)) return "ayer "+hora;
  return f.toLocaleDateString("es-CL",{day:"2-digit",month:"2-digit"})+" "+hora;
}
async function marcarMiEstado(estado,boton){
  const sel=document.getElementById("miVoluntario"), msg=document.getElementById("miEstadoMsg");
  if(!sel||!sel.value){
    if(msg){msg.textContent="Selecciona tu nombre antes de marcar el estado.";msg.classList.add("err");}
    if(navigator.vibrate) navigator.vibrate([80,45,80]);
    return;
  }
  const botones=[...document.querySelectorAll(".status-choice")];
  botones.forEach(b=>{b.classList.remove("operating");b.disabled=true;});
  if(boton) boton.classList.add("operating");
  if(navigator.vibrate) navigator.vibrate(55);
  try{
    const d=await getDisponibilidadHoy();
    d[sel.value]={estado,desde:new Date().toISOString()};
    await sSet(dispKey(),d);
    try{ const vig=await sGet(DISP_VIGENTE_KEY,{}); vig[sel.value]=d[sel.value]; await rawSet(DISP_VIGENTE_KEY,vig); DISP_PREV=null; }
    catch(e){ console.warn("No se pudo actualizar el último estado de cada voluntario",e); }
    if(msg){ delete msg.dataset.hint; msg.classList.remove("err");msg.textContent=DISP_LABELS[estado]+" · actualizado a las "+new Date().toLocaleTimeString("es-CL",{hour:"2-digit",minute:"2-digit"});}
    await renderDisponibilidad();
    if(navigator.vibrate) navigator.vibrate([45,35,90]);
  }catch(e){
    console.error("No se pudo actualizar disponibilidad",e);
    if(msg){msg.textContent="No fue posible guardar el estado. Intenta nuevamente.";msg.classList.add("err");}
    if(navigator.vibrate) navigator.vibrate([120,60,120]);
  }finally{
    botones.forEach(b=>{b.disabled=false;b.classList.remove("operating");});
  }
}
/* ============ ODD PARA LOS VOLUNTARIOS ============
   El Ayudante (o Secretario o Capitán) informa una ODD con unos pocos datos; los voluntarios la ven como una tarjeta corta
   (qué es y cuándo). Al tocarla se abre el detalle, con «Agregar a mi calendario» y el PDF si lo hay. Desaparece sola a la
   hora de la citación; el registro (y el PDF) quedan guardados como archivo. Sin servicios externos y sin costo: se lee
   un registro pequeño por minuto y el PDF solo se descarga si alguien lo toca. */
const AVISOS_ODD_KEY="odd-avisos:v1";
const AVISO_TOAST_MS=10000;
const AVISO_TIPOS={citacion:"Citación",academia:"Academia",curso:"Curso",taller:"Taller",ejercicio:"Ejercicio",disposicion:"Disposición",otro:"Otro"};
const AVISO_CARGOS=["Ayudante","Secretario","Capitán"];
const AVISO_PDF_MAX=1536*1024;
let AVISOS_ODD=null, AVISOS_ODD_HASTA=0, AVISO_TOASTEADOS=new Set(), AVISOS_VER_TODAS=false;
const avisoN=t=>String(t||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function avisoCargoHabilitado(cargo){ const c=avisoN(cargo); return AVISO_CARGOS.some(x=>avisoN(x)===c); }
/* Administrador del sistema: puede hacer las mismas tareas de administración que el Ayudante, el Secretario o el Capitán
   (informar ODD, actualizar la precedencia, retirar guardias de prueba). Se identifica por su código de voluntario. */
const ADMIN_CLAVES=["517"];
const puedeAdministrar=m=>!!m&&(avisoCargoHabilitado(m.cargo)||ADMIN_CLAVES.includes(String(m.clave)));

/* Hora de Chile -> instante absoluto (considera el horario de verano). */
function instanteChile(fecha,hora){
  const [y,m,d]=String(fecha).split("-").map(Number), [hh,mm]=String(hora||"00:00").split(":").map(Number);
  const suponer=Date.UTC(y,m-1,d,hh,mm);
  const desfase=ms=>{ const p=new Intl.DateTimeFormat("en-US",{timeZone:"America/Santiago",hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"}).formatToParts(new Date(ms)).reduce((o,x)=>{o[x.type]=x.value;return o;},{}); return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second)-ms; };
  let t=suponer-desfase(suponer); t=suponer-desfase(t); return t;
}
async function cargarAvisosOdd(forzar){
  if(!forzar&&AVISOS_ODD&&Date.now()<AVISOS_ODD_HASTA) return AVISOS_ODD;
  try{ const v=await sGet(AVISOS_ODD_KEY,[]); AVISOS_ODD=Array.isArray(v)?v:[]; AVISOS_ODD_HASTA=Date.now()+60000; }
  catch(e){ AVISOS_ODD=AVISOS_ODD||[]; }
  return AVISOS_ODD;
}
function avisoVigente(a,ahora){
  ahora=ahora||Date.now();
  if(!a||a.anulada||!Array.isArray(a.destinatarios)||!a.destinatarios.includes("voluntarios")) return false;
  const desde=a.visibleDesde?Date.parse(a.visibleDesde):0, hasta=a.visibleHasta?Date.parse(a.visibleHasta):Infinity;
  if(Number.isNaN(desde)||Number.isNaN(hasta)) return false;
  return ahora>=desde&&ahora<hasta;
}
function avisoRestante(hasta,ahora){
  const ms=hasta-ahora; if(!isFinite(ms)) return "";
  const min=Math.floor(ms/60000);
  if(min<1) return "menos de 1 minuto";
  if(min<60) return min+" min";
  const hh=Math.floor(min/60), mm=min%60;
  if(hh<48) return hh+" h"+(mm?" "+mm+" min":"");
  return Math.floor(hh/24)+" días";
}
function avisoVisto(id){ try{ return JSON.parse(localStorage.getItem("germania:odd-vistas")||"[]").includes(id); }catch(e){ return false; } }
function marcarAvisoVisto(id){ try{ const v=JSON.parse(localStorage.getItem("germania:odd-vistas")||"[]"); if(!v.includes(id)){ v.push(id); localStorage.setItem("germania:odd-vistas",JSON.stringify(v.slice(-100))); } }catch(e){} }
const avisoFechaCorta=a=>{ const c=a.cuando; if(!c||!c.fecha) return ""; const f=new Date(c.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"short",day:"numeric",month:"short"}).replace(".",""); return f+(c.hora?" · "+c.hora:""); };

/* ---- Lo que ven los voluntarios ---- */
async function renderAvisosOdd(forzar){
  const box=document.getElementById("avisosOdd"); if(!box) return;
  const ahora=Date.now();
  const lista=(await cargarAvisosOdd(forzar)).filter(a=>avisoVigente(a,ahora)).sort((x,y)=>String(x.visibleHasta||"~").localeCompare(String(y.visibleHasta||"~")));
  if(!lista.length){ if(box.innerHTML) box.innerHTML=""; return; }
  if(lista.length<=2) AVISOS_VER_TODAS=false;
  const visibles=AVISOS_VER_TODAS?lista:lista.slice(0,2), resto=lista.length-visibles.length;
  const html=visibles.map(a=>{
    const hasta=a.visibleHasta?Date.parse(a.visibleHasta):Infinity, nueva=!avisoVisto(a.id);
    /* El tipo solo se muestra si el título no lo dice ya («Academia de Extricación I» no repite «Academia») */
    const tipo=AVISO_TIPOS[a.tipo]||"", verTipo=tipo&&a.tipo!=="otro"&&!avisoN(a.titulo).includes(avisoN(tipo));
    const linea=[verTipo?tipo:"",avisoFechaCorta(a),a.lugar?String(a.lugar).split(",")[0]:"",(isFinite(hasta)&&a.cuando)?"faltan "+avisoRestante(hasta,ahora):""].filter(Boolean).join(" · ")||"Toca para ver el detalle";
    return `<div class="card" role="button" tabindex="0" data-aviso-odd="${esc(a.id||"")}" style="display:block;box-sizing:border-box;width:100%;max-width:100%;min-width:0;overflow:hidden;text-align:left;cursor:pointer;border:1px solid #c9a227;margin-bottom:8px;padding:8px 12px;color:#101214;">
      <div style="display:flex;gap:8px;align-items:center;min-width:0;">
        ${nueva?'<span style="flex:none;background:#c9a227;color:#000;border-radius:999px;padding:0 9px;font-size:12px;font-weight:700;">Nueva</span>':""}
        <b style="flex:1 1 auto;min-width:0;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(a.titulo||"")}</b></div>
      <div style="font-size:13px;color:#5f6b76;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(linea)}</div>
    </div>`;
  }).join("")+(resto>0?`<button type="button" class="btn small secondary" data-odd-mas style="margin:0 0 10px;">+${resto} ODD vigente${resto===1?"":"s"} · ver</button>`:"");
  if(box.innerHTML!==html){
    box.innerHTML=html;
    box.querySelectorAll("[data-aviso-odd]").forEach(b=>{
      b.addEventListener("click",()=>abrirDetalleOdd(b.dataset.avisoOdd));
      b.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); abrirDetalleOdd(b.dataset.avisoOdd); } });
    });
    const mas=box.querySelector("[data-odd-mas]"); if(mas) mas.addEventListener("click",()=>{ AVISOS_VER_TODAS=true; renderAvisosOdd(false).catch(()=>{}); });
  }
  /* Aviso de 10 segundos para la primera ODD nueva que aún no se ha visto en este equipo */
  const nuevo=lista.find(a=>!avisoVisto(a.id)&&!AVISO_TOASTEADOS.has(a.id));
  if(nuevo) mostrarToastOdd(nuevo);
}
function mostrarToastOdd(a){
  AVISO_TOASTEADOS.add(a.id);
  const anterior=document.getElementById("oddToast"); if(anterior) anterior.remove();
  const t=document.createElement("div"); t.id="oddToast"; t.setAttribute("role","button"); t.tabIndex=0;
  t.style.cssText="position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:100001;box-sizing:border-box;width:max-content;max-width:92vw;background:#c9a227;color:#000;border-radius:10px;padding:9px 14px;font-weight:700;font-size:14px;line-height:1.2;text-align:center;cursor:pointer;";
  t.textContent="Nueva ODD "+(a.numero||"")+" · toca para ver";
  t.onclick=()=>{ t.remove(); abrirDetalleOdd(a.id); }; t.onkeydown=e=>{ if(e.key==="Enter"||e.key===" ") t.onclick(); };
  document.body.appendChild(t);
  setTimeout(()=>{ if(t.parentNode) t.remove(); },AVISO_TOAST_MS);
}
function cerrarModalOdd(){ const m=document.getElementById("oddModal"); if(m) m.remove(); }
function modalOdd(html){
  cerrarModalOdd();
  const f=document.createElement("div"); f.id="oddModal";
  f.style.cssText="position:fixed;inset:0;background:#000b;z-index:100000;display:flex;align-items:flex-start;justify-content:center;padding:14px;overflow:auto;";
  const c=document.createElement("div");
  c.style.cssText="background:#15171c;border:1px solid #3a3d44;border-radius:12px;max-width:560px;width:100%;padding:16px;color:#fff;margin:auto;";
  c.innerHTML=html; f.appendChild(c); document.body.appendChild(f);
  f.addEventListener("click",e=>{ if(e.target===f) cerrarModalOdd(); });
  return c;
}
async function abrirDetalleOdd(id){
  const a=(await cargarAvisosOdd(false)).find(x=>x.id===id); if(!a) return;
  marcarAvisoVisto(id);
  const aviso=document.getElementById("oddToast"); if(aviso) aviso.remove();
  const fila=(k,v)=>v?`<div style="display:flex;gap:10px;margin:6px 0;"><span style="flex:0 0 96px;color:#9aa0a8;">${k}</span><b>${esc(v)}</b></div>`:"";
  const cuando=a.cuando&&a.cuando.fecha?new Date(a.cuando.fecha+"T12:00").toLocaleDateString("es-CL",{weekday:"long",day:"numeric",month:"long"})+(a.cuando.hora?" a las "+a.cuando.hora+" hrs.":""):"";
  const c=modalOdd(`
    <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><span class="badge">${esc(AVISO_TIPOS[a.tipo]||"ODD")}</span><small style="color:#9aa0a8;">Orden del Día ${esc(a.numero||"")}</small></div>
    <h2 style="margin:8px 0 10px;">${esc(a.titulo||"")}</h2>
    ${cuando?`<p style="margin:0 0 10px;font-size:16px;">${esc(cuando)}</p>`:""}
    ${fila("Lugar:",a.lugar)}${fila("Tema:",a.tema)}${fila("Vestimenta:",a.vestimenta)}${fila("Importante:",a.nota)}
    ${a.puntualidad?'<p style="margin:12px 0 0;"><b><u>Se exige PUNTUALIDAD</u></b></p>':""}
    ${a.excusas?`<p style="margin:6px 0 0;color:#9aa0a8;">Excusas al correo ${esc(a.excusas)}</p>`:""}
    <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
      ${a.cuando&&a.cuando.fecha?'<button type="button" class="btn small" id="oddCalBtn">Agregar a mi calendario</button>':""}
      ${a.pdf?'<button type="button" class="btn small secondary" id="oddPdfBtn">Ver ODD completa (PDF)</button>':""}
      <button type="button" class="btn small secondary" id="oddCerrarBtn">Cerrar</button></div>`);
  c.querySelector("#oddCerrarBtn").onclick=cerrarModalOdd;
  const cal=c.querySelector("#oddCalBtn"); if(cal) cal.onclick=()=>descargarIcs(a);
  const pdf=c.querySelector("#oddPdfBtn"); if(pdf) pdf.onclick=()=>abrirPdfAviso(a.pdf);
  renderAvisosOdd(false).catch(()=>{});
}
async function abrirPdfAviso(clave){
  try{
    const d=await sGet(clave,null);
    if(!d||!d.dataUrl){ alert("El documento no está disponible."); return; }
    const blob=await (await fetch(d.dataUrl)).blob();
    const url=URL.createObjectURL(blob);
    const w=window.open(url,"_blank");
    if(!w){ const a=document.createElement("a"); a.href=url; a.target="_blank"; a.rel="noopener"; document.body.appendChild(a); a.click(); a.remove(); }
    setTimeout(()=>URL.revokeObjectURL(url),60000);
  }catch(e){ alert("No fue posible abrir el documento."); }
}

/* ---- Agregar al calendario (archivo .ics, hora de Chile, recordatorios 2 h y 30 min antes) ---- */
const icsEscapar=t=>String(t||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\r?\n/g,"\\n");
const icsFecha=ms=>new Date(ms).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}/,"");
function construirIcs(a){
  const ini=instanteChile(a.cuando.fecha,a.cuando.hora||"00:00"), fin=ini+(a.duracionMin||120)*60000;
  const desc=[`Orden del Día ${a.numero||""}`,a.tema?"Tema: "+a.tema:"",a.vestimenta?"Vestimenta: "+a.vestimenta:"",a.puntualidad?"Se exige PUNTUALIDAD":"",a.excusas?"Excusas al correo "+a.excusas:""].filter(Boolean).join("\n");
  return ["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Quinta Compania Germania//ODD//ES","CALSCALE:GREGORIAN","METHOD:PUBLISH","BEGIN:VEVENT",
    "UID:odd-"+String(a.id||"").replace(/[^\w-]/g,"")+"@germania","DTSTAMP:"+icsFecha(Date.now()),"DTSTART:"+icsFecha(ini),"DTEND:"+icsFecha(fin),
    "SUMMARY:"+icsEscapar(a.titulo||"Orden del Día"),a.lugar?"LOCATION:"+icsEscapar(a.lugar):"","DESCRIPTION:"+icsEscapar(desc),
    "BEGIN:VALARM","TRIGGER:-PT2H","ACTION:DISPLAY","DESCRIPTION:"+icsEscapar(a.titulo||"Orden del Día"),"END:VALARM",
    "BEGIN:VALARM","TRIGGER:-PT30M","ACTION:DISPLAY","DESCRIPTION:"+icsEscapar(a.titulo||"Orden del Día"),"END:VALARM","END:VEVENT","END:VCALENDAR"].filter(Boolean).join("\r\n")+"\r\n";
}
function descargarIcs(a){
  const blob=new Blob([construirIcs(a)],{type:"text/calendar;charset=utf-8"});
  const url=URL.createObjectURL(blob), l=document.createElement("a");
  l.href=url; l.download="ODD-"+String(a.numero||"").replace(/[^\w]+/g,"-")+".ics";
  document.body.appendChild(l); l.click(); l.remove(); setTimeout(()=>URL.revokeObjectURL(url),30000);
}

/* ---- «Ayudante informa ODD» ---- */
function infoAvisoQuienSoy(){ const id=(document.getElementById("miVoluntario")||{}).value; return ROSTER.find(p=>String(p.id)===String(id))||null; }
async function abrirFormularioAviso(editarId){
  const yo=infoAvisoQuienSoy();
  if(!yo||!puedeAdministrar(yo)){
    const titulares=ROSTER.filter(p=>p.activo!==false&&avisoCargoHabilitado(p.cargo)).map(p=>`${p.cargo}: ${nombreCompleto(p)}`);
    modalOdd(`<h2 style="margin:0 0 8px;">Ayudante informa ODD</h2><p>Solo el Ayudante, el Secretario, el Capitán o el administrador pueden informar una ODD. ${yo?`Hoy tu cargo es «${esc(yo.cargo||"Voluntario")}».`:"Selecciona tu nombre en «Voluntario que está usando este dispositivo» (pantalla principal)."}</p>${titulares.length?`<p style="color:#9aa0a8;font-size:13px;">Titulares actuales: ${esc(titulares.join(" · "))}</p>`:""}<div style="margin-top:12px;"><button type="button" class="btn small secondary" id="oddCerrarBtn">Cerrar</button></div>`).querySelector("#oddCerrarBtn").onclick=cerrarModalOdd;
    return;
  }
  const lista=await cargarAvisosOdd(true);
  const ed=editarId?lista.find(x=>x.id===editarId):null;
  const anio=String(new Date().getFullYear()), nums=lista.filter(x=>String(x.numero||"").endsWith("/"+anio)).map(x=>parseInt(x.numero,10)).filter(Number.isFinite);
  const sugerido=nums.length?String(Math.max(...nums)+1).padStart(3,"0")+"/"+anio:"";
  const v=(k,def)=>esc(ed&&ed[k]!==undefined?ed[k]:(def||""));
  const cu=ed&&ed.cuando?ed.cuando:{};
  const campo=(id,etq,html)=>`<div style="margin:8px 0;"><label for="${id}" style="display:block;font-size:13px;color:#c9ccd1;margin-bottom:3px;">${etq}</label>${html}</div>`;
  const inp=(id,val,extra)=>`<input id="${id}" value="${val}" ${extra||""} style="width:100%;box-sizing:border-box;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">`;
  const recientes=lista.slice().sort((x,y)=>String(y.publicadaEn||"").localeCompare(String(x.publicadaEn||""))).slice(0,8);
  const c=modalOdd(`
    <h2 style="margin:0 0 4px;">Ayudante informa ODD</h2>
    <p style="margin:0 0 8px;color:#9aa0a8;font-size:13px;">Lo básico para que los voluntarios la vean en su pantalla. ${ed?"Estás editando la ODD "+esc(ed.numero)+".":""}</p>
    ${campo("avTipo","Tipo",`<select id="avTipo" style="width:100%;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">${Object.entries(AVISO_TIPOS).map(([k,t])=>`<option value="${k}"${(ed?ed.tipo:"citacion")===k?" selected":""}>${t}</option>`).join("")}</select>`)}
    ${campo("avNumero","N.º de la ODD (ej. 063/"+anio+")",inp("avNumero",v("numero",sugerido),'placeholder="063/'+anio+'" inputmode="numeric"'))}
    ${campo("avTitulo","Título corto (qué es)",inp("avTitulo",v("titulo"),'placeholder="Academia de Extricación I"'))}
    <div style="display:flex;gap:8px;">${campo("avFecha","Fecha de la actividad",inp("avFecha",esc(cu.fecha||""),'type="date"'))}${campo("avHora","Hora",inp("avHora",esc(cu.hora||""),'type="time"'))}</div>
    ${campo("avLugar","Lugar",inp("avLugar",v("lugar"),'placeholder="Cuartel General, Valentín Letelier #630"'))}
    ${campo("avTema","Tema (opcional)",inp("avTema",v("tema")))}
    ${campo("avVestimenta","Vestimenta (opcional)",inp("avVestimenta",v("vestimenta"),'placeholder="Uniforme de trabajo"'))}
    ${campo("avHasta","Mostrar hasta (solo si no tiene fecha de actividad)",inp("avHasta",esc(ed&&!cu.fecha&&ed.visibleHasta?ed.visibleHasta.slice(0,10):""),'type="date"'))}
    ${campo("avExcusas","Excusas al correo",inp("avExcusas",v("excusas","germaniacbv@gmail.com")))}
    <label style="display:flex;gap:8px;align-items:center;margin:8px 0;"><input type="checkbox" id="avPuntual"${ed?(ed.puntualidad?" checked":""):" checked"}> Se exige puntualidad</label>
    ${campo("avPdf","PDF de la ODD (opcional, máx. 1,5 MB)",'<input type="file" id="avPdf" accept="application/pdf">')}
    ${MODO_PRUEBA_ABIERTO?"":campo("avClave","Clave de Oficialidad",'<input type="password" id="avClave" style="width:100%;box-sizing:border-box;padding:9px;background:#0d0e11;border:1px solid #3a3d44;border-radius:6px;color:#fff;">')}
    <div id="avMsg" style="min-height:20px;margin:8px 0;font-size:13.5px;color:#ff8a80;"></div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;"><button type="button" class="btn" id="avPublicar">${ed?"Guardar cambios":"Publicar a los voluntarios"}</button><button type="button" class="btn secondary" id="avCancelar">Cancelar</button></div>
    ${recientes.length?`<h3 style="margin:18px 0 6px;">Publicadas</h3>${recientes.map(x=>`<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;border-top:1px solid #3a3d44;padding:8px 0;"><span style="font-size:13.5px;">${esc(x.numero||"")} · ${esc(x.titulo||"")}${x.anulada?' <small style="color:#ffb74d;">(retirada)</small>':""}</span><span style="display:flex;gap:6px;"><button type="button" class="btn small secondary" data-av-editar="${esc(x.id)}">Editar</button>${x.anulada?"":`<button type="button" class="btn small secondary" data-av-retirar="${esc(x.id)}">Retirar</button>`}</span></div>`).join("")}`:""}`);
  c.querySelector("#avCancelar").onclick=cerrarModalOdd;
  c.querySelectorAll("[data-av-editar]").forEach(b=>b.onclick=()=>abrirFormularioAviso(b.dataset.avEditar));
  c.querySelectorAll("[data-av-retirar]").forEach(b=>b.onclick=async()=>{
    if(!confirm("¿Retirar esta ODD de la pantalla de los voluntarios? Queda guardada en el archivo.")) return;
    try{ await retirarAvisoOdd(b.dataset.avRetirar); abrirFormularioAviso(); }catch(e){ c.querySelector("#avMsg").textContent="No se pudo retirar: "+((e&&e.message)||e); }
  });
  c.querySelector("#avPublicar").onclick=async()=>{
    const msg=c.querySelector("#avMsg"), btn=c.querySelector("#avPublicar"); msg.style.color="#ff8a80"; msg.textContent="";
    btn.disabled=true;
    try{
      await publicarAvisoOdd({editarId:ed?ed.id:null,tipo:c.querySelector("#avTipo").value,numero:c.querySelector("#avNumero").value.trim(),titulo:c.querySelector("#avTitulo").value.trim(),
        fecha:c.querySelector("#avFecha").value,hora:c.querySelector("#avHora").value,lugar:c.querySelector("#avLugar").value.trim(),tema:c.querySelector("#avTema").value.trim(),
        vestimenta:c.querySelector("#avVestimenta").value.trim(),hasta:c.querySelector("#avHasta").value,excusas:c.querySelector("#avExcusas").value.trim(),
        puntualidad:c.querySelector("#avPuntual").checked,archivo:(c.querySelector("#avPdf").files||[])[0]||null,clave:(c.querySelector("#avClave")||{}).value||""});
      cerrarModalOdd();
      alert("ODD informada. Los voluntarios ya la ven en su pantalla.");
    }catch(e){ msg.textContent=(e&&e.message)||"No se pudo publicar."; btn.disabled=false; }
  };
}
async function publicarAvisoOdd(f){
  const num=String(f.numero||"");
  if(!/^\d{1,3}\/\d{4}$/.test(num)) throw new Error("Escribe el número de la ODD con este formato: 063/2026.");
  if(!f.titulo) throw new Error("Escribe el título corto: qué es la ODD.");
  if(f.fecha&&!/^\d{4}-\d{2}-\d{2}$/.test(f.fecha)) throw new Error("La fecha de la actividad no es válida.");
  if(f.hora&&!f.fecha) throw new Error("Indica también la fecha de la actividad.");
  if(!f.fecha&&!f.hasta) throw new Error("Indica la fecha de la actividad, o hasta qué día se muestra la ODD.");
  const yo=infoAvisoQuienSoy(); if(!yo||!puedeAdministrar(yo)) throw new Error("Solo el Ayudante, el Secretario, el Capitán o el administrador pueden informar una ODD.");
  if(!MODO_PRUEBA_ABIERTO){ const r=await autenticarOficialidad(String(f.clave||"").trim()); if(!r.ok) throw new Error(mensajeOficialidad(r.motivo)); }
  const [anioODD,nroODD]=[num.split("/")[1],num.split("/")[0].padStart(3,"0")];
  const id=f.editarId||("odd-"+anioODD+"-"+nroODD);
  const ahora=new Date().toISOString();
  const visibleHasta=f.fecha?new Date(instanteChile(f.fecha,f.hora||"23:59")).toISOString():new Date(instanteChile(f.hasta,"23:59")).toISOString();
  let pdfClave=null;
  if(f.archivo){
    if(f.archivo.type!=="application/pdf") throw new Error("El archivo debe ser un PDF.");
    if(f.archivo.size>AVISO_PDF_MAX) throw new Error("El PDF pesa más de 1,5 MB. Publica la ODD sin PDF o reduce el archivo.");
    const dataUrl=await new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=()=>rej(new Error("No se pudo leer el PDF.")); r.readAsDataURL(f.archivo); });
    pdfClave="odd-pdf:"+id.replace(/^odd-/,"");
    if(!(await sSet(pdfClave,{mime:"application/pdf",nombre:f.archivo.name,dataUrl,guardadoEn:ahora}))) throw new Error("No se pudo guardar el PDF.");
  }
  const lista=(await cargarAvisosOdd(true)).map(x=>Object.assign({},x));
  const previo=lista.find(x=>x.id===id), idx=lista.findIndex(x=>x.id===id);
  const reg=Object.assign({},previo||{},{id,numero:num,tipo:f.tipo,titulo:f.titulo,destinatarios:["voluntarios"],
    cuando:f.fecha?{fecha:f.fecha,hora:f.hora||""}:null,lugar:f.lugar,tema:f.tema,vestimenta:f.vestimenta,excusas:f.excusas,puntualidad:!!f.puntualidad,
    visibleDesde:(previo&&previo.visibleDesde)||ahora,visibleHasta,informadaPor:yo.id,publicadaEn:(previo&&previo.publicadaEn)||ahora,
    modificadaEn:previo?ahora:undefined,version:((previo&&previo.version)||0)+1,anulada:false});
  if(pdfClave) reg.pdf=pdfClave;
  if(idx>=0) lista[idx]=reg; else lista.push(reg);
  if(!(await sSet(AVISOS_ODD_KEY,lista))) throw new Error("No se pudo guardar la ODD. Inténtalo de nuevo.");
  AVISOS_ODD=lista; AVISOS_ODD_HASTA=Date.now()+60000;
  await renderAvisosOdd(true);
}
async function retirarAvisoOdd(id){
  const lista=(await cargarAvisosOdd(true)).map(x=>x.id===id?Object.assign({},x,{anulada:true,retiradaEn:new Date().toISOString()}):x);
  if(!(await sSet(AVISOS_ODD_KEY,lista))) throw new Error("No se pudo guardar el cambio.");
  AVISOS_ODD=lista; AVISOS_ODD_HASTA=Date.now()+60000;
  await renderAvisosOdd(true);
}
on("oddInformarBtn","click",()=>abrirFormularioAviso());
setInterval(()=>{ renderAvisosOdd(false).catch(()=>{}); },60000);
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible") renderAvisosOdd(true).catch(()=>{}); });

async function guardiaDeHoy(){
  const idx=await idxGuardias();
  const it=idx.slice().reverse().find(x=>x.fecha===todayISO());
  return it?await getGuardia(it.clave):null;
}
async function renderDisponibilidad(){
  const body=document.getElementById("dispBody"), resumen=document.getElementById("dispResumen");
  if(!body||!resumen) return;
  const d=await getDisponibilidadVigente(), guardia=await guardiaDeHoy();
  const guardianes=new Set((guardia?.guardianes||[]).filter(g=>g.estado!=="no").map(g=>String(g.id)));
  const cuenta={cuartel:0,disponible:0,fuera:0,no:0,conductores:0};

  const apellido=(p)=>[p.apellidoPaterno||"",p.apellidoMaterno||"",p.nombre||""].join(" ").trim();
  const ciudad=(p)=>{
    const r=d[p.id]||{};
    return String(r.ciudad||r.localidad||r.ubicacion||r.lugar||"").trim();
  };
  const prioridad=(p)=>{
    const e=d[p.id]?.estado||"";
    if(e==="cuartel") return 0;
    if(e==="disponible") return 1;
    if(e==="fuera") return 2;
    return 3;   /* "no disponible" y quienes aún no han declarado nada quedan en el mismo grupo */
  };
  const rosterOrdenado=sortedRoster(false).map((p,indice)=>({p,indice})).sort((a,b)=>{
    const pa=prioridad(a.p), pb=prioridad(b.p);
    if(pa!==pb) return pa-pb;
    if(pa===0||pa===1) return apellido(a.p).localeCompare(apellido(b.p),"es",{sensitivity:"base"})||a.indice-b.indice;
    if(pa===2){
      const porCiudad=ciudad(a.p).localeCompare(ciudad(b.p),"es",{sensitivity:"base"});
      return porCiudad||apellido(a.p).localeCompare(apellido(b.p),"es",{sensitivity:"base"})||a.indice-b.indice;
    }
    return a.indice-b.indice;
  }).map(x=>x.p);

  const html=rosterOrdenado.map(p=>{
    const r=d[p.id]||{}, declarado=!!r.estado, e=r.estado||"no";
    cuenta[e]=(cuenta[e]||0)+1;
    if((e==="cuartel"||e==="disponible")&&p.conductor) cuenta.conductores++;
    const desde=dispDesdeTexto(r);
    const foto=fotoVoluntario(p);
    return `<tr data-voluntario-id="${esc(String(p.id))}">
      <td style="text-align:center;"><img src="${foto}" alt="" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:1px solid #c9a227;display:block;margin:auto;"></td>
      <td class="name-col">${esc(nombreCompleto(p))}</td>
      <td>${'<span class="dot '+esc(e)+'"></span>'+esc(DISP_LABELS[e])}${declarado?'':' <small style="color:var(--muted)">· sin declarar</small>'}</td>
      <td>${desde}</td>
      <td style="text-align:center;">${p.conductor?"◉":"—"}</td>
      <td style="text-align:center;">${guardianes.has(String(p.id))?"🛡":"—"}</td></tr>`;
  }).join("");

  if(body.innerHTML!==html) body.innerHTML=html;
  const resumenHtml=`
    <div class="summary-item"><div class="big">${cuenta.cuartel}</div><div class="lbl">En cuartel</div></div>
    <div class="summary-item"><div class="big">${cuenta.disponible}</div><div class="lbl">Disponibles</div></div>
    <div class="summary-item"><div class="big">${cuenta.no}</div><div class="lbl">No disponibles</div></div>
    <div class="summary-item"><div class="big">${cuenta.fuera}</div><div class="lbl">Fuera de Villarrica</div></div>
    <div class="summary-item"><div class="big">${cuenta.conductores}</div><div class="lbl">Conductores disponibles</div></div>`;
  if(resumen.innerHTML!==resumenHtml) resumen.innerHTML=resumenHtml;
  const sel=document.getElementById("miVoluntario");
  const actual=sel&&sel.value?d[sel.value]:null;
  document.querySelectorAll(".status-choice").forEach(b=>b.classList.toggle("active",!!actual&&b.dataset.estado===actual.estado));
  /* Recordatorio amable (no cambia nada solo): si el estado viene de un día anterior, se avisa */
  const ayuda=document.getElementById("miEstadoMsg");
  if(ayuda){
    if(actual&&actual.arrastrado){ ayuda.classList.remove("err"); ayuda.dataset.hint="1"; ayuda.textContent=`Tu estado sigue siendo «${DISP_LABELS[actual.estado]}» (${dispDesdeTexto(actual)}). Si cambió tu situación, toca el botón que corresponda.`; }
    else if(ayuda.dataset.hint==="1"){ delete ayuda.dataset.hint; ayuda.textContent=""; }
  }
}
on("miVoluntario","change",async e=>{
  const p=ROSTER.find(x=>String(x.id)===String(e.target.value));
  if(p) guardarVoluntarioDispositivo(p);
  refrescarIdentidadVoluntario();
  await renderDisponibilidad();
});
on("cambiarFotoBtn","click",()=>{
  const sel=document.getElementById("miVoluntario");
  if(!sel||!sel.value){ const msg=document.getElementById("miEstadoMsg"); if(msg){msg.textContent="Selecciona tu nombre antes de agregar la foto.";msg.classList.add("err");} return; }
  document.getElementById("miFotoInput")?.click();
});
on("miFotoInput","change",async e=>{
  const archivo=e.target.files&&e.target.files[0], sel=document.getElementById("miVoluntario"); if(!archivo||!sel?.value) return;
  e.target.value="";
  try{
    const p=ROSTER.find(x=>String(x.id)===String(sel.value)); if(!p) return;
    await guardarFotoVoluntario(p,archivo);
    await refrescarIdentidadVoluntario();
  }catch(err){ alert((err&&err.message)||"No fue posible guardar la foto del voluntario."); }
});
document.querySelectorAll(".status-choice").forEach(b=>b.addEventListener("click",()=>marcarMiEstado(b.dataset.estado,b)));
on("actualizarMinuta","click",renderDisponibilidad);
on("menuToggle","click",()=>{
  const m=document.getElementById("mobileMenu"), b=document.getElementById("menuToggle");
  const abierto=m.classList.toggle("open"); b.setAttribute("aria-expanded",abierto?"true":"false");
});
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>{
  const destino=b.dataset.go;
  if(window.__mostrarPestana) window.__mostrarPestana(destino);
  const m=document.getElementById("mobileMenu"); if(m) m.classList.remove("open");
  const t=document.getElementById("menuToggle"); if(t) t.setAttribute("aria-expanded","false");
}));

/* ============ TABS ============ */
function switchTabExtra(name){
  if(name==="germania") renderDisponibilidad();
  if(name==="historial") renderHistorial();
  if(name==="servicio"){
    const f=document.getElementById("svFecha");
    if(f && !f.value) f.value=todayISO();
    cargarServicio();
  }
  if(name==="panel") renderPanel();
  if(name==="guardia"){
    const f=document.getElementById("gnFechaIng");
    if(f && !f.value){ f.value=todayISO(); const s=document.getElementById("gnFechaSal");
      const d=new Date(); d.setDate(d.getDate()+1); s.value=d.toISOString().slice(0,10); }
    if(!document.getElementById("gnDesde").value) document.getElementById("gnSemana").click();
    renderGnOficial(); cargarGuardia(); renderGnLista(); renderGnPlanner().catch(console.error);
  }
  if(name==="config"){
    // Oficiales abre liviano: no consulta módulos secundarios hasta que el usuario los solicita.
    // Esto evita la ráfaga de lecturas simultáneas que bloqueaba la interfaz.
    pintarCandado();
  }
}
function switchTab(name){ if(window.__mostrarPestana) window.__mostrarPestana(name); }

/* ============ INIT ============ */
(async function init(){
  document.getElementById("crestImg").src=LOGO_B64;
  document.getElementById("membreteLogo").src=LOGO_B64;
  document.getElementById("todayLabel").textContent=fmtDateLong(todayISO());

  // El aviso de carga permanece visible hasta que la nómina esté cargada,
  // el selector de voluntarios haya sido poblado y el navegador la haya pintado.
  const ocultarCarga=()=>document.getElementById("appLoading")?.classList.add("hidden");
  const esperarPintado=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));

  try{
    await loadAll();
    // Guardia se sincroniza y valida en segundo plano. Nunca bloquea el arranque
    // de la Tablet B-5 ni la selección del voluntario.
    /* Las guardias de prueba ya no se siembran al abrir la app (se retiran desde Oficiales → Importar / respaldo). */
    /* Las validaciones de la Guardia de prueba ya no corren en cada apertura:
       validarGuardiaPruebaEnero2026() y validarMatrizGuardiaPrueba() siguen
       disponibles para ejecutarlas a mano cuando se necesiten. */
    renderAvisosOdd(true).catch(()=>{}); renderGnInscripcionCard(true).catch(()=>{}); sembrarPrecedencia();
    renderTipoSelect(); populateTipoFilters(); renderRegistradoPorOptions(); renderCargoOptions();
    document.getElementById("ordenModo").value=ORDEN_MODO;
    document.getElementById("anioOficialidad").value=new Date().getFullYear();
    document.getElementById("fecha").value=todayISO();
    // Datos secundarios: sincronizan sin bloquear la pantalla ni cambiar la pestaña actual.
    Promise.allSettled([
      loadListaForSelection(),
      renderDisponibilidad()
    ]).then(resultados=>{
      resultados.filter(x=>x.status==="rejected").forEach(x=>console.error("Sincronización inicial:",x.reason));
    });
    cargarMiVoluntario();
    pintarCandado();
    await esperarPintado();
    ocultarCarga();

    // Reconciliación histórica idempotente: completa automáticamente cualquier
    // actividad faltante del XLS 2026 sin duplicar las que ya existen.
    // Corre en segundo plano para no bloquear la Tablet B-5.
    sGet(IMPORT_KEY,null)
      .then(ya=>ya?0:importarHistorico2026())
      .then(n=>{ if(n) console.info("Histórico 2026 completado:",n,"actividad(es) faltante(s)."); })
      .catch(e=>console.error("No se pudo reconciliar la base 2026",e));
  }catch(e){
    console.error("Inicio GERMANIA:",e);
    ocultarCarga();
  }
  // La minuta se actualiza al entrar, al marcar estado o al pulsar Actualizar. Sin refresco periódico para evitar parpadeos.
})();

/* Correo institucional GERMANIA: punto de activación visible en Oficialidad.
   La autorización OAuth de Gmail se implementa del lado servidor; nunca se solicita ni almacena la contraseña en el navegador. */
on("activarCorreoCompaniaBtn","click",()=>{
  const e=document.getElementById("correoCompaniaEstado");
  if(e) e.textContent="Correo oficial: germaniacbv@gmail.com · conexión institucional pendiente de autorización Google.";
  alert("GERMANIA usará germaniacbv@gmail.com como correo oficial. La conexión se realizará mediante autorización segura de Google; la contraseña no se guarda en GERMANIA.");
});

/* Respuesta tactil: Android/PWA vibra suavemente al pulsar controles. En PC no hace nada. */
document.addEventListener("click",function(e){const b=e.target.closest("button,.btn,.tab,.subtab");if(!b||b.disabled)return;try{if(navigator.vibrate)navigator.vibrate(22)}catch(_){}},{passive:true});

/* Guardia integral: arranque no intrusivo */
document.addEventListener("DOMContentLoaded",()=>{ const av=document.getElementById("miFoto"); if(av){av.classList.add("loading"); av.addEventListener("load",()=>av.classList.remove("loading")); av.addEventListener("error",()=>{av.classList.add("loading"); if(!av.src.endsWith("/legacy/germania-icon.png")) av.src="/legacy/germania-icon.png";});} });
